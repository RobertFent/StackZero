# Installation

on local machine
```bash
source .venv/bin/activate
pip3 install ansible
pip3 install ansible-lint
brew install sshpass
```

on remote machine
```bash
 sudo apt-get install sshpass
```
## Test if setup worked
```bash
export $(cat .env | xargs)
ansible-inventory -i inventory.ini --list
ansible homeserver -m ping -i inventory.ini --extra-vars "ansible_ssh_pass=$SSH_PASS"
ansible-playbook -i inventory.ini playbooks/setup_test_playbook.yml --extra-vars "ansible_ssh_pass=$SSH_PASS github_token=$GITHUB_PAT"
```

## Setup test env
### Build ubuntu test server
```bash
docker build -t ubuntu-ssh .
docker compose -f docker/docker-compose.yml up -d --build
```
### connect to ubuntu test server and see if it worked (password is test)
```bash
ssh test@localhost -p 2222
```

### run commands against test server
```bash
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini playbooks/setup_test_playbook.yml
ANSIBLE_HOST_KEY_CHECKING=False ansible-playbook -i inventory.ini playbooks/home_server_setup_playbook.yml --extra-vars "github_token=$GITHUB_PAT"
```

## run it
```bash
ansible-playbook -i inventory.ini playbooks/home_server_setup_playbook.yml --extra-vars "ansible_ssh_pass=$SSH_PASS github_token=$GITHUB_PAT"
```