#example 
#debug.sh test/index.test.js
DEBUG=api node --inspect-brk node_modules/.bin/jest --runInBand $1

# then open chrome://inspect with chrome