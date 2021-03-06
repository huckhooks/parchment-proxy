#!/usr/bin/python
#called as builder from aptana/eclipse
#copies ../quixe-work into serverlayout

import os
import shutil
import sys
import traceback

#http://stefaanlippens.net/redirect_python_print
class SilentBuffer:
    content = []
    def write(self, string):
        self.content.append(string)
    def verbose(self):
        sys.stdout = sys.__stdout__
        for line in self.content:
            print line

class Builder(object):
    src_dir = ""; dst_dir = ""
    def setup(self):
        dir = os.path.dirname(os.path.abspath(__file__))
        print "basedir " + dir
        os.chdir(dir)
        
        self.src_dir = os.path.abspath("../quixe-work")
        print "src " + self.src_dir
        self.dst_dir = os.path.abspath("quixe-work")
        print "dst " + self.dst_dir
        
    def run(self):
        if os.path.exists(self.dst_dir):
            shutil.rmtree(self.dst_dir)
        shutil.copytree(self.src_dir, self.dst_dir)
        
        for proj in [
                     "Hack_Hooks_Demo",
                     "Hack_Hooks_Demo_De",
                     "Custom_Quixe_Miniext",
                     "Custom_Quixe_Miniext_De",
                     ]:
            
            print proj
        
            shutil.rmtree(os.path.join(self.dst_dir, proj + ".inform/Build"), True)
            shutil.rmtree(os.path.join(self.dst_dir, proj + ".inform/Index/Details"), True)
            for file in ["Actions.html", "Contents.html", "Kinds.html", 
                         "Headings.xml", "Phrasebook.html", "Rules.html",
                         "Scenes.html"]:
                os.remove(os.path.join(self.dst_dir, 
                                       proj + ".inform/Index", file))
            shutil.move(os.path.join(self.dst_dir, proj + " Materials"), 
                        os.path.join(self.dst_dir, proj + "_Materials"))  
            shutil.rmtree(os.path.join(self.dst_dir, proj + "_Materials/Templates"), True)

        shutil.rmtree(os.path.join(self.dst_dir, "local"))
        shutil.rmtree(os.path.join(self.dst_dir, "stories"))
        shutil.rmtree(os.path.join(self.dst_dir, "tools"))
 
        shutil.rmtree(os.path.join(self.dst_dir, ".git"))
       
        print "copied"
        
        #http://xahlee.org/perl-python/findreplace_multi_pairs.html
        
findreplace = [
    (' Materials/', '_Materials/')
]        
def make_spaceless():
    def replaceStringInFile(filePath):
       "replaces all findStr by repStr in file filePath"
       print filePath
       tempName = filePath + '~~~'
       input = open(filePath)
       output = open(tempName, 'w')
       s = input.read()
       for couple in findreplace:
           outtext = s.replace(couple[0], couple[1])
           s = outtext
       output.write(outtext)
       output.close()
       input.close()
       os.rename(tempName, filePath)

    def myfun(dummy, dirr, filess):
        for child in filess:
            if (('.html' == os.path.splitext(child)[1] 
                    or '.js' == os.path.splitext(child)[1])
            and os.path.isfile(dirr + '/' + child)):
                replaceStringInFile(dirr + '/' + child)
                print child

    mydir = os.path.dirname(os.path.abspath(__file__))          
    os.path.walk(mydir, myfun, None)

if __name__ == '__main__':
    silent = SilentBuffer()
    sys.stdout = silent
    try:    
        print "proxy-builder " + __file__
        b = Builder()
        b.setup()
        b.run()
        #silent.verbose()    
        make_spaceless()
        #raise Exception('exception handling test')
    except:
        silent.verbose()
        traceback.print_exc()


    
