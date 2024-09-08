const os = require("os")

//  info about crrent user
const user = os.userInfo()
console.log(user)

// method  returns the ystem uptime in seconds
console.log(`The System Upyime is ${os.uptime()} seconds`)

const currentOS = {
  name: os.type(),
  name: os.release(),
  name: os.totalmem(),
  name: os.freemem(),
}

console.log(currentOS)