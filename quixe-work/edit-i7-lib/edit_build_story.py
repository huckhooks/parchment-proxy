#!/usr/bin/python

import os
import shutil
import subprocess
import sys
import re

cli_inform7 = os.path.expanduser("~/Inform/cli-inform/bin/i7")
dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(dir)
i7_project = sys.argv[2];

def build_story():
    if not os.path.exists(cli_inform7):
        print "Warning: no cli-inform installed, ignoring"
        return
    
    p = subprocess.Popen([
                             cli_inform7,
                             '-r', i7_project + ".inform",
                             '-s', 'blorb=1,zcode=g'
                             ],
                             stdout=subprocess.PIPE,
                             stderr=subprocess.STDOUT)
    output = p.communicate()[0]
    print output
    if -1 == output.find('! Completed: wrote blorb file of size '):
        raise Exception('i7-compile failed, read log')
    
if __name__ == '__main__':
    try:
        ok = build_story()
        #gargoyle-free
        #if sys.argv[1] == "--wait" and not ok or 1:
        if ok:
            if 0:
                proc = subprocess.Popen([
                                     "/usr/games/gargoyle-free",
                                     #"/home/huck/git/quixe-work/ide/Hack_Hooks_Demo Materials/Release/Hack_Hooks_Demo.gblorb"
                                     os.path.join(i7_project + " Materials","Release/" + i7_project + ".gblorb")
                                     ])
                ret = proc.wait()
                if (ret):
                    raise Exception('Process result code %d' % (ret,))
            
    
        #else:
    except:
        print "Error:", sys.exc_info()
        raw_input('Press return to close xterm ')
        print "done"
