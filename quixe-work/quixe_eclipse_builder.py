#!/usr/bin/python
#called as builder from aptana/eclipse
#builds story with cli-i7
#copies Material to spaceless to pass to proxy. 
#  gae does not like spaces. play*.html has gae-path.. so copied here.

import os
import shutil
import subprocess
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
        self.content = []
    def clear(self):
        self.content = []

sys.stdout = SilentBuffer()

project_dir = os.path.dirname(os.path.abspath(__file__))
cli_inform7 = os.path.expanduser("~/Inform/cli/bin/i7")
i7_project = project_dir
    
def build_story():
    if not os.path.exists(cli_inform7):
        print "Warning: no cli-inform installed, ignoring"
        return
    
    os.chdir(i7_project)
      
    output = subprocess.Popen([
                             cli_inform7,
                             '-r', 'Hack_Hooks_Demo.inform',
                             '-s', 'blorb=1,zcode=g'
                             ], stdout=subprocess.PIPE, stderr=subprocess.STDOUT)\
    .communicate()[0]
    print output
    
def build():
    build_story()

if __name__ == '__main__':
    print "quixe_builder " + __file__
    build()


    
