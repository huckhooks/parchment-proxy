#!/usr/bin/python
#called as builder from aptana/eclipse
#copies ../quixe-work parts into gh-pages

import os
import shutil
import sys

#http://stefaanlippens.net/redirect_python_print
class SilentBuffer:
    content = []
    def write(self, string):
        self.content.append(string)
    def verbose(self):
        sys.stdout = sys.__stdout__
        for line in self.content:
            print line

dir = os.path.dirname(os.path.abspath(__file__))        
os.chdir(dir)
dst = "../quixe-pages"
src = "Hack_Hooks_Demo Materials"
    
def refresh(dir):
  dst_dir = os.path.join(dst,dir)
  if os.path.exists(dst_dir):
    shutil.rmtree(dst_dir)
  shutil.copytree(os.path.join(src,dir), dst_dir)
  print "copied %s to %s" % (src,dst)
        
if __name__ == '__main__':
    silent = SilentBuffer()
    sys.stdout = silent
    print "quixe-pages-builder " + __file__
    
    try:    
        refresh("Release")
        refresh("Browsies")
        print "quixe-pages-builder done"
    except:
        silent.verbose()    
        print "Error:", sys.exc_info()


    
