#!/usr/bin/env python

# Quixe build script.
#
# This packs together all the Javascript source into two files, using
# yuicompressor. As a special bonus, lines (or part-lines) beginning with
# ';;;' are stripped out. We use this to get rid of debugging log statements
# and assertions.

import sys
import re
import subprocess

#X-XX
import os
import shutil
import subprocess

#X-XX
os.chdir(os.path.dirname(__file__))
dest_lib = 'lib'
dest_template = 'Hack_Hooks_Demo Materials/Templates/Custom-Quixe'
dest_release = 'Hack_Hooks_Demo Materials/Release/interpreter'
dest_edit = 'edit-i7-lib/js'

regex_debug = re.compile(';;;.+$', re.M)

def compress_source(target, srcls):
    full_target = os.path.join(dest_lib,target)
    print 'Writing', target
    proc = subprocess.Popen(['java', '-jar', 'tools/yuicompressor-2.4.2.jar', '--type', 'js', '-o', full_target],
                            stdin=subprocess.PIPE)
    for src in srcls:
        fl = open(src)
        dat = fl.read()
        dat = regex_debug.sub('', dat)
        fl.close()
        proc.stdin.write(dat)
    proc.stdin.close()
    ret = proc.wait()
    if (ret):
        raise Exception('Process result code %d' % (ret,))
    #XXX
    shutil.copyfile(full_target,os.path.join(dest_template,target))
    shutil.copyfile(full_target,os.path.join(dest_release,target))
    shutil.copyfile(full_target,os.path.join(dest_edit,target))

compress_source(
    'glkote.min.js', [
        'src/prototype-1.7.js',
        'src/glkote/glkote.js',
        'src/glkote/dialog.js',
        'src/glkote/glkapi.js',
        ])

compress_source(
    'quixe.min.js', [
        'src/quixe/quixe.js',
        'src/quixe/gi_dispa.js',
        'src/quixe/gi_load.js',
        ])

compress_source(
    'hack_hooks.min.js', [
        'src/hack_hooks/hack_hooks.js',
        ])

compress_source(
    'edit.min.js', [
        'src/hack_hooks/hotkeys.js',
        'src/hack_hooks/hack_hooks_frame.js',
        'src/hack_hooks/edit.js',
        ])

print "done"