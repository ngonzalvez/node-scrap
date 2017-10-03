const Logger = {
    level: 0,

    log: (msg, lvl=1) => {
        if (lvl <= Logger.level) {
            console.log(msg)
        }
    }
};


module.exports = Logger;
