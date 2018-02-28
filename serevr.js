const fs = require('fs');
const execSync = require('child_process').execSync;
const config = {"filePath": "/Users/robin/test", "git_Address": "ssh://git@code.newxxxx.com:9922/","origin":"origin"};
let count = {"总共": 0, "成功": 0, "失败": 0, "未知": 0};

/**
 * 执行命令函数
 * @param cmd_Sql
 * @param isCount
 * @returns {Promise}
 */
const exelCmd = function (cmd_Sql,isCount) {
    return new Promise(function (resolve, reject) {
        try {
            const cmd = execSync(cmd_Sql);
            //更新计数
            if(isCount){
                count.成功 += 1;
            }
            resolve(cmd.toString());
        }
        catch (e) {
            //更新计数
            count.失败 += 1;
            console.log(`失败命令:${e.cmd}`);
            // reject(e);自定义错误
            resolve("err");
        }
    })
};

/**
 * 读取文件函数
 * @param filePath
 * @returns {Promise<any>}
 */
function readFile(filePath) {
    return new Promise(function (resolve, reject) {
        fs.readdir(filePath, function (error, result) {
            if (!error) {
                resolve(result);
            }
            else {
                console.log(`请检查路径`);
                reject(error);
            }
        });
    });
}

/**
 * 逻辑代码
 * @param filePath
 * @returns {Promise<void>}
 */
async function start(filePath) {
    let file_info = await readFile(filePath);
    for (let i = 0; i < file_info.length; i++) {
        count.总共 = file_info.length;
        //过滤隐藏文件
        if (file_info[i].substring(0, 1) == ".") {
            continue;
            count.未知 += 1;
        }
        console.log(`当前项目名称:${file_info[i]}`);
        //获取更新前地址
        let getOldAddress=await exelCmd (`cd ${filePath}/${file_info[i]}&&git remote -v`);
        if(getOldAddress!="err"){
            console.log(`更新前地址:\n`+getOldAddress)
            //进入项目目录，删除旧的git指向,设置新git指向
            await exelCmd(`cd ${filePath}/${file_info[i]}&&git remote rm ${config.origin}&&git remote add ${config.origin} ${config.git_Address}${file_info[i]}`,'F');
            console.log(`更新后地址:\n`+await exelCmd (`cd ${filePath}/${file_info[i]}&&git remote -v`))
        }

    }
    //输出计数
    console.log(count);
}

/**
 * 入口
 */
start(config.filePath);