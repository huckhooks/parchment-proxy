#!/usr/bin/python

import sys
import os
import shutil

inform7 = os.path.expanduser("~/Inform")
dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(dir)

if __name__ == '__main__':
    try:
        p = os.path.join(inform7,"Extensions",sys.argv[2],sys.argv[1] + ".i7x")
        print p
        shutil.copyfile(sys.argv[3], p)
    except:
        print "Error:", sys.exc_info()
        raw_input('Press return to close xterm ')
        print "done"
