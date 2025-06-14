FROM ubuntu:22.04

# install ssh server
RUN apt update && apt install  openssh-server sudo -y

# create robot user with proper dir, bash and root + sudo group with id 1000
RUN useradd -rm -d /home/robot -s /bin/bash -g root -G sudo -u 1000 robot 

# create robot user
RUN  echo 'robot:robot' | chpasswd

# allow robot user to run sudo without password
RUN echo 'robot ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# start ssh service
RUN service ssh start

# expose ssh port
EXPOSE 22

# run ssh daemon
CMD ["/usr/sbin/sshd","-D"]