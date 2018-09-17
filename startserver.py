import os
import time
def killport(port):
    command='''kill -9 $(netstat -nlp | grep :'''+str(port)+''' | awk '{print $7}' | awk -F"/" '{print $1}')'''
    os.system(command)
os.system('mkdir logs')
os.system('chmod u+x startserver_reboot.sh')
while True:
    print('start the system')
    os.system('bash ./startserver_reboot.sh >> logs/server_log.out')
    
    print('the system exit,')
    print('kill port=7779')
    killport(7779)
    print('remove cache')
    os.system('rm -r .atm_server_cache')
    print('after 1 second, the system will restart.')
    time.sleep(1)
