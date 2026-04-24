app.service('myService', function() {
  var storedValue=''
    // this.city = "arani"
    this.name = "uk"
    this.setValue = function(value){
          storedValue = value
    }
    this.getValue = function(){
      return storedValue
    }
  });