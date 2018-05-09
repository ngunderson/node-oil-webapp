# This script can be used to login to the server container
#!/bin/bash
containerName=server

docker exec -t -i $containerName /bin/bash
