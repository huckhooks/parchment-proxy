from google.appengine.ext import webapp
from django.utils import simplejson
import logging
from google.appengine.ext import db
import hashlib

class History(db.Model):
    full_log = db.StringListProperty()
    base_md5 = db.StringProperty()
    pass

class IndexHistoryHandler(webapp.RequestHandler):
    def get(self):
        
        json = self.request.get('json')
        logging.info("in> %s" % json)
        json = simplejson.loads(json)
        jsonp = json["jsonp"]
        history = json["history"]
        req_id = json["req_id"]
        
        log = None
        if history.get("base_md5") :
            db_parent_history = History.get_by_key_name(history.get("base_md5"))
            log = list(db_parent_history.full_log)
            log.extend(history["log"])
        else:
            log = history["log"]
            
        #TODO fix unicode
        log_md5 = hashlib.md5("\n".join(log).encode( "utf-8" )).hexdigest()
        db_history = History.get_by_key_name(log_md5)
        if not db_history :
            db_history = History(key_name=log_md5)
            db_history.full_log = log
            if history.get("base_md5") :
                db_history.base_md5 = history.get("base_md5") #for docu
            db_history.put()

        response = {}        
        response["req_id"] = req_id
        response["base_log_md5"] = log_md5
        if "read" in json["opt"]:
            response["full_log"] = log
        else:
            response["log_len"] = len(log)
        
        self.response.headers["Content-Type"] = "text/javascript"
        res = ("%s(%s);" % (jsonp, simplejson.dumps(response)))
        #enable to test client errorhandling
        #x = 1 / 0 
        self.response.out.write( res )

