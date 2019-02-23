# promise
前端异步技术之Promise
从事前端的朋友或多或少的接触过Promise，当代码中回调函数层级过多你就会发现Promise异步编程的魅力，相信此文一定能帮你排忧解惑

## Promise概念
Promise是JS异步编程中的重要概念，异步抽象处理对象，是目前比较流行Javascript异步编程解决方案之一
或许是笔者理解能力有限，对官方术语怎么也感受不到亲切，下面我来用通俗易懂的语言解释下：
Promise是一个包含三种状态的对象（pending、fulfilled、rejected），可以链式的处理异步请求（then方法）并能很好地处理异常问题，
是解决回调地狱的良好方案之一。
回调函数处理多层异步示例
```
$.ajax({
    url: url1,
    success: function(rsp){
        $.ajax({
           url: url2,
           success: function(rsp){
               $.ajax({
                  url: url3,
                  success: function(rsp){
                      //do sth
                  },
                  error: function(error){
                  }
              });
           },
           error: function(error){
           }
       });
    },
    error: function(error){
    }
});
```
将promise封装在$.ajax中
```
$.ajax = function(config){
    return new Promise(function(resolve, reject){
        //1省略...
        xmlhttp.onreadystatechange = function(){
            if(xmlhttp.status==200){
                resolve(rspData);
            }else{
                reject(xmlhttp.statusText);
            }
        };
        //2省略...
    })
}
$.ajax({url: url1}).then(function(val){
    return $.ajax({url: val.url})
}).then(function(val){
    return $.ajax({url: val.url})
}).catch(function(err){
    console.log(err);
}}
```
封装好的Promise处理异步可读性可维护性以及代码美观度不言而喻

### 创建Promise对象
```
//pending状态的promise
var promise = new Promise(function(resolve, reject){
	//do sth
})
//fulfilled状态的promise
var promise = Promise.resolve(1).then(function resolve(value){console.log(value)});
// var promise = new Promise(function(resolve){resolve(1)})
//rejected状态的promise
var promise = Promise.reject(new Error('error')).catch(function(error){console.error(error)});
// var promise = new Promise(function(resolve,reject){resolve(new Error('error'))})
```
### Promise.prototype.then & Promise.prototype.catch
```
Promise#then
promise.then(onFulfilled, onRejected)
```
返回一个新的promise
这里经常会有一个疑问：为什么不返回原来的promise，个人是这样认为的，若返回同一个promise则状态不一致，
promise规范说明当pending至fulfilled/rejected时状态确定后不能再改变。
```
Promise#catch
promise.catch(function(error){
    throw new Error(error);
})
```
注意：IE8及以下版本会出现 identifier not found 的语法错误，可将点标记法改为中括号标记法
```
promise['catch'](function(error){
    throw new Error(error);
})
```
rejected状态的promise抛出异常
相当于
```
promise.then(undefined, onRejected)

promise.then(function f1(value){
    //do sth 1
}).then(function f2(value){
    //do sth 2
}).then(function f3(value){
    //do sth 3
}).catch(function(error){
    console.log(error);
})
```
### Promise.all
```
promise.all([promise1, promise2, promise3]).then(resolve);

// `delay`毫秒后执行resolve
function timerPromisefy(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    });
}
var startDate = Date.now();
// 所有promise变为resolve后程序退出
Promise.all([
    timerPromisefy(1),
    timerPromisefy(32),
    timerPromisefy(64),
    timerPromisefy(128)
]).then(function (values) {
    console.log(Date.now() - startDate + 'ms');
    // 约128ms
    console.log(values);    // [1,32,64,128]
});
```
在接收到所有的对象promise都变为 FulFilled 返回一个resolve(array);或者 某一个promise对象变成Rejected 状态返回reject(err)
传递给 Promise.all 的promise并不是一个个的顺序执行的，而是同时开始、并行执行的

### Promise.race
```
promise.race([promise1, promise2]).then(resolve, reject)
// `delay`毫秒后执行resolve
function timerPromisefy(delay) {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(delay);
        }, delay);
    });
}
// 任何一个promise变为resolve或reject 的话程序就停止运行
Promise.race([
    timerPromisefy(1),
    timerPromisefy(32),
    timerPromisefy(64),
    timerPromisefy(128)
]).then(function (value) {
    console.log(value);    // => 1
});
```
只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理。

### Promise.prototype.finally
```
promise.finally(onFinally)
```
返回一个Promise，在promise执行结束时，无论结果是fulfilled或者是rejected，在执行then()和catch()后，都会执行
