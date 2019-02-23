/**
 * @author chenchangyuan
 * @date 2019-02-23
 * */
function Promise(executor){
    if(typeof executor !== 'function'){
        throw new Error('executor is not a function');
    }
    var self = this;
    self.state = 'pending';//pending fulfilled rejected
    self.value = null;
    self.reason = null;
    self.callbackResolveFn = [];
    self.callbackRejectFn = [];
    function resolve(value){
        if(self.state === 'pending'){
            self.state = 'fulfilled';
            self.value = value;
            self.callbackResolveFn.forEach(function(fn){
                fn();
            });
        }
    }
    function reject(reason){
        if(self.state === 'pending'){
            self.state = 'rejected';
            self.reason = reason;
            self.callbackRejectFn.forEach(function(fn){
                fn();
            });
        }
    }
    try{
        executor(resolve, reject);
    }catch(err){
        reject(err);
    }
}
//回溯函数
function resolvePromise(promise, x, resolve, reject){
    if(promise === x) return reject(new TypeError('循环引用'));
    var flag = false;
    if(x !== null && (typeof x === 'object' || typeof x === 'function')){
        try{
            var then = x.then;
            if(typeof then === 'function'){
                then.call(x, function(val){
                    if(flag) return;
                    flag = true;
                    resolvePromise(promise, val, resolve, reject);
                }, function(err){
                    if(flag) return;
                    flag = true;
                    reject(err);
                });
            }else{
                resolve(x);
            }
        } catch(err){
            if(flag) return;
            flag = true;
            reject(err);
        }

    }else{
        resolve(x);
    }
}
//返回一个新的promise（pending：push(fn),fulfilled:resolve(val),rejected:reject(reason)）
Promise.prototype.then = function(onFulfilled, onRejected){
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : function(value){
        return value;
    };
    onRejected = typeof onRejected === 'function' ? onRejected : function(err){
        throw new Error(err);
    };
    var self = this,
        promise2;
    if(self.state === 'fulfilled'){
        promise2 = new Promise(function(resolve, reject){
            setTimeout(function(){
                try{
                    //将x处理成一个原始值
                    var x = onFulfilled(self.value);
                    resolvePromise(promise2, x, resolve, reject);
                } catch(e){
                    reject(e);
                }
            })
        })
    }
    if(self.state === 'rejected'){
        promise2 = new Promise(function(resolve, reject){
            setTimeout(function(){
                try{
                    //将x处理成一个原始值
                    var x = onRejected(self.reason);
                    resolvePromise(promise2, x, resolve, reject);
                } catch(e){
                    reject(e);
                }
            })
        })
    }
    if(self.state === 'pending'){
        promise2 = new Promise(function(resolve, reject){
            self.callbackResolveFn.push(function(){
                setTimeout(function(){
                    try{
                        //将x处理成一个原始值
                        var x = onFulfilled(self.value);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch(e){
                        reject(e);
                    }
                })
            });
            self.callbackRejectFn.push(function(){
                setTimeout(function(){
                    try{
                        //将x处理成一个原始值
                        var x = onRejected(self.reason);
                        resolvePromise(promise2, x, resolve, reject);
                    } catch(e){
                        reject(e);
                    }
                })
            });
        })
    }
    return promise2;
}
Promise.prototype['catch']= function (callback) {
    return this.then(undefined, callback)
}
Promise.all = function (promises) {
    return new Promise(function (resolve, reject) {
        let arr = [];
        let i = 0;
        function processData(index, y) {
            arr[index] = y;
            if (++i === promises.length) {
                resolve(arr);
            }
        }
        for (let i = 0; i < promises.length; i++) {
            promises[i].then(function (y) {
                processData(i, y)
            }, reject)
        }
    })
}
Promise.race = function (promises) {
    return new Promise(function (resolve, reject) {
        for (var i = 0; i < promises.length; i++) {
            promises[i].then(resolve,reject)
        }
    });
}
Promise.resolve = function(value){
    return new Promise(function(resolve,reject){
        resolve(value);
    });
}
Promise.reject = function(reason){
    return new Promise(function(resolve,reject){
        reject(reason);
    });
}
Promise.defer = Promise.deferred = function () {
    var d = {};
    d.promise = new Promise(function (resolve, reject) {
        d.resolve = resolve;
        d.reject = reject;
    });
    return d
}
module.exports = Promise;
