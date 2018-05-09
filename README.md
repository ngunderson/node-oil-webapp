# node-oil-webapp
Oil web app created for Software Maintenance

# Build
These install instructions currently only work on Linux (though the application should be easy to run on Windows).
Prerequisites:
- Have docker installed on your system.
- create an env.list file container your 'Azure.IoT.IoTHub.ConsumerGroup', 'Azure.IoT.IoTHub.ConnectionString', and
'AZURE_STORAGE_CONNECTION_STRING'. These are needed by the Azure services this app uses.

Then in Bash execute the `restart_docker.sh` script.
This script will build the image, remove old container with name `server`, and then start the container with the
name `server`. The website should then be available at localhost:8080.
