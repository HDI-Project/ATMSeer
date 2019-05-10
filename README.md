# ATMSeer: Increasing Transparency and Controllability in Automated Machine Learning

### Abstract

To relieve the pain of manually selecting machine learning algorithms and tuning hyperparameters, automated machine learning (AutoML) methods have been developed to automatically search for good models.
Due to the huge model search space, it is impossible to try all models. Users tend to distrust automatic results and increase the search budget as much as they can, thereby undermining the efficiency of AutoML.
To address these issues, we design and implement ATMSeer, an interactive visualization tool that supports users in refining the search space of AutoML and analyzing the results.
To guide the design of ATMSeer, we derive a workflow of using AutoML based on interviews with machine learning experts.
A multi-granularity visualization is proposed to enable users to monitor the AutoML process, analyze the searched models, and refine the search space in real time.
We demonstrate the utility and usability of ATMSeer through two case studies, expert interviews, and a user study with 13 end users.

The paper has been published at **ACM CHI 2019**.[PDF](https://arxiv.org/abs/1902.05009)

=========================

# Video

[![ATMSEER VIDEO](https://img.youtube.com/vi/7QwN3mmiCzY/0.jpg)](http://www.youtube.com/watch?v=7QwN3mmiCzY "Video Title")

=========================


# Perequisites
Download and install [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://www.vagrantup.com/downloads.html)

=========================

# Download ATMSeer

```
git clone https://github.com/HDI-Project/ATMSeer.git
```

Then go to ATMSeer project from the terminal and run

```
sh install.sh
```

This will install all the necessary packages in a virtual environment.
After the installation finishes, run

```
vagrant provision --provision-with vagrantstart
```

Then, access `http://localhost:7777/` at your web broswer to see the ATMSeer.


Upload `blood.csv` from `public/viz/blood.csv`, add Dataruns `(+ button)` and hit Run

There are small issues at first run, you have to give it couple tries `(vagrant reload, vagrant provision --provision-with vagrantstart)` until console errors dissapear.

After that, you should be able to start the env by using

```
sh start.sh
```
