import os, json, subprocess
grades = {}
for i in os.listdir():
    grades[i] = {
        'grade':0,
        'feedback':'Output:',
    }
    os.chdir('./'+i)
    fname = os.listdir()[0]
    proc = subprocess.Popen('python',
                            stdout=subprocess.PIPE,
                            stdin=subprocess.PIPE,
                            stderr=subprocess.STDOUT)
    out = proc.communicate(open(fname).read().encode('utf-8'))[0].decode()
    retcode = proc.wait(2)
    # print(retcode)
    out=out.replace('\r','')[:-1]
    if(retcode!=0):
        grades[i]['feedback'] = 'Program does not exit properly. Possible runtime error.'
        os.chdir('..')
        continue
    try:
        out = [int(x) for x in out.split('\n')]
        for output in out:
            if(output>0):
                grades[i]['grade']+=2
            grades[i]['feedback']+=(str(output)+';')

    except:
        grades[i]['feedback'] = 'Crash at split at rounding. Maybe output is not ints'
    # print(out)
    os.chdir('..')
print(json.dumps(grades))