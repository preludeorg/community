# Community

Prelude Community holds all open-source TTPs, payloads, plugins and training modules for the Operator platform.

> Prelude Operator is a command-and-control (C2) center which allows you to run manual to semi-autonomous security assessments
> Watch our quick [introduction video](https://www.youtube.com/watch?v=Hz8K-jdqpBY)
> You can download the latest copy of the application [here](https://www.prelude.org/download/current), for either MacOS, Windows or Linux. 

When you boot up Operator, it loads the resources from this repo into your application and keeps them up-to-date:

- TTPs are singular attacks, which when composed together, form [attack chains](https://chains.prelude.org)
- Payloads are separate binaries that TTPs can (optionally) attach
- Plugins are extensions to Operator which allow you to write your own code into the platform.
- Training contains continuous security education built directly into Operator

If you'd like to use this repository outside of Operator, clone it recursively:
```
git clone git@github.com:preludeorg/community.git --recursive
```

## Operator licenses

If you have a Professional license your Operator instance will automatically sync with the Prelude Closed Bucket, which contains
all of our closed-source resources and weekly [attack chains](https://chains.prelude.org).

If you have an Enterprise license you can stand up your own private bucket, syncing your resources across your team. 

Get in touch at support@prelude.org.
