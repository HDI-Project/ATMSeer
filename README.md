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
Download and install or update [VirtualBox](https://www.virtualbox.org/wiki/Downloads) and [Vagrant](https://www.vagrantup.com/downloads.html)

=========================

# Download ATMSeer

```
git clone https://github.com/HDI-Project/ATMSeer.git
```

Then go to ATMSeer project from the terminal and run

```
sh install.sh
```
This will install all the necessary packages in a virtual environment and start the server.

After the installation process is done, you should be able to see this log in the terminal:

```
....
default:  * Serving Flask app "server" (lazy loading)
default:  * Environment: development
default:  * Debug mode: on
default: [INFO] [08:07:01:werkzeug]  * Running on http://0.0.0.0:7777/ (Press CTRL+C to quit)
default: [INFO] [08:07:01:werkzeug]  * Restarting with stat
default: [WARNING] [08:07:17:werkzeug]  * Debugger is active!
default: [INFO] [08:07:17:werkzeug]  * Debugger PIN: 206-317-029
default: No valid rules have been specified for JavaScript files
```
Your environment is ready!

At this point -  access `http://localhost:7779/` in your web browser.
Upload `blood.csv` from `public/viz/`, add Dataruns `(+ button)` and hit Run

There are small issues at first run:
At first upload step, couple console errors will be present - ignore them.

Go to terminal, stop the process by pressing `CTRL+C` and run 
```
vagrant reload
```

Go to the browser, refresh the page, and from the `Dataset` dropdown select `blood` as dataset and hit the run button again.
At this step, you should be able to see HyperPartitions and HyperParameters of selected algorithm.

If there's problems, go to terminal, stop the process (CTRL+C), run `sh cleanup.sh && vagrant reload` and repeat the upload process.