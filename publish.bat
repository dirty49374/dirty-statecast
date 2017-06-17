ECHO dirty-statecast-client START

cd dirty-statecast-client
npm version patch
npm publish
npm install -g
cd ..

ECHO dirty-statecast-client DONE

ECHO dirty-statecast-ioclient START

cd dirty-statecast-ioclient
npm version patch
npm publish
npm install -g
cd ..

ECHO dirty-statecast-ioclient DONE

ECHO dirty-statecast-server START

cd dirty-statecast-server
npm version patch
npm publish
npm install -g
cd ..

ECHO dirty-statecast-server DONE

