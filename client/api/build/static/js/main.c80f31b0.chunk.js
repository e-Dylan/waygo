(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{36:function(e,t,a){e.exports=a.p+"static/media/userlocation_icon.48db4103.svg"},37:function(e,t,a){e.exports=a.p+"static/media/waymessage_icon.a445d694.svg"},40:function(e,t,a){e.exports=a(75)},47:function(e,t,a){},49:function(e,t,a){},69:function(e,t){},75:function(e,t,a){"use strict";a.r(t);var n=a(0),s=a.n(n),o=a(19),r=a.n(o),i=(a(45),a(46),a(47),a(14)),c=a.n(i),u=a(20),l=a(18),p=a(21),m=a(13),d=a(15),h=a(17),g=a(16),f=a(39),v=a(8),y=a.n(v),b=(a(86),a(87),a(78),a(88),a(79),a(80),a(81),a(82),a(83),a(84),a(85),a(36)),w=a.n(b),j=a(37),O=a.n(j),k=(a(49),a(26)),x=a.n(k),S="localhost"===window.location.hostname?"http://localhost:5000/api/waymessages":"production-url-here";a(69);var E=a(3),C=new function e(){Object(m.a)(this,e),Object(E.h)(this,{loading:!0,isLoggedIn:!1,username:""})},M=function(e){Object(h.a)(a,e);var t=Object(g.a)(a);function a(){return Object(m.a)(this,a),t.apply(this,arguments)}return Object(d.a)(a,[{key:"render",value:function(){var e=this;return s.a.createElement("div",{className:"input-field"},s.a.createElement("input",{className:this.props.className||"input",type:this.props.type,placeholder:this.props.placeholder,value:this.props.value,onChange:function(t){return e.props.onChange(t.target.value)}}))}}]),a}(s.a.Component),W=function(e){Object(h.a)(a,e);var t=Object(g.a)(a);function a(){return Object(m.a)(this,a),t.apply(this,arguments)}return Object(d.a)(a,[{key:"render",value:function(){var e=this;return s.a.createElement("div",{className:"submit-button"},s.a.createElement("button",{className:this.props.className||"btn",disabled:this.props.disabled,onClick:function(){return e.props.onClick()}},this.props.text))}}]),a}(s.a.Component),L=function(e){Object(h.a)(a,e);var t=Object(g.a)(a);function a(e){var n;return Object(m.a)(this,a),(n=t.call(this,e)).state={username:"",password:"",email:"",buttonDisabled:!1},n}return Object(d.a)(a,[{key:"setStateFromInputValue",value:function(e,t){(t=t.trim()).length>30||this.setState(Object(l.a)({},e,t))}},{key:"resetForm",value:function(){this.setState({username:"",password:"",email:"",buttonDisabled:!1})}},{key:"doLogin",value:function(){var e=Object(u.a)(c.a.mark((function e(){var t,a;return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return this.setState({buttonDisabled:!0}),e.prev=1,e.next=4,fetch("/login",{method:"post",headers:{Accept:"application/json","Content-Title":"application/json"},body:JSON.stringify({username:this.state.username,email:this.state.email,password:this.state.password})});case 4:t=e.sent,(a=t.json())&&a.success?(C.isLoggedIn=!0,C.username=a.username):a&&!a.success&&(this.resetForm(),alert(a.msg)),e.next=13;break;case 9:e.prev=9,e.t0=e.catch(1),console.log(e.t0),this.resetForm();case 13:case"end":return e.stop()}}),e,this,[[1,9]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this;return s.a.createElement("div",{className:"login-form"},"Log in.",s.a.createElement(M,{type:"text",placeholder:"username",value:this.state.username?this.state.username:"",onChange:function(t){return e.setStateFromInputValue("username",t)}}),s.a.createElement(M,{type:"email",placeholder:"email",value:this.state.email?this.state.email:"",onChange:function(t){return e.setStateFromInputValue("email",t)}}),s.a.createElement(M,{type:"text",placeholder:"password",value:this.state.password?this.state.password:"",onChange:function(t){return e.setStateFromInputValue("password",t)}}),s.a.createElement(W,{text:"Login",disabled:this.state.buttonDisabled,onClick:function(){return e.doLogin()}}))}}]),a}(s.a.Component),I=(y.a.icon({iconUrl:w.a,iconSize:[50,82],popupAnchor:[0,-72],shadowUrl:"my-icon-shadow.png",shadowSize:[68,95],shadowAnchor:[22,94]}),y.a.icon({iconUrl:O.a,iconSize:[50,82],popupAnchor:[0,-32],shadowUrl:"my-icon-shadow.png",shadowSize:[68,95],shadowAnchor:[22,94]}),x.a.object({username:x.a.string().regex(/^[a-zA-Z\xc0-\xff0-9-_]{1,30}$/).required(),message:x.a.string().min(1).max(300).required()})),N="localhost"==window.location.hostname?"http://localhost:5000/api/waymessages":"production-url-here",F=function(e){Object(h.a)(a,e);var t=Object(g.a)(a);function a(){var e;Object(m.a)(this,a);for(var n=arguments.length,s=new Array(n),o=0;o<n;o++)s[o]=arguments[o];return(e=t.call.apply(t,[this].concat(s))).state={userPosition:{lat:51.505,lng:-.09},hasUserPosition:!1,markerPosition:{lat:0,lng:0},activeMarker:!1,zoom:2,userWayMessage:{name:"",message:""},showWayMessageForm:!1,sendingWayMessage:!1,sentWayMessage:!1,waymessages:[]},e.mapOnClick=function(t){console.log(t),e.setState((function(e){return{markerPosition:Object(p.a)(Object(p.a)({},e.markerPosition),{},{lat:t.latlng.lat,lng:t.latlng.lng})}})),console.log(e.state.markerPosition)},e.waymessageValueChanged=function(t){var a=t.target,n=a.name,s=a.value;e.setState((function(e){return{userWayMessage:Object(p.a)(Object(p.a)({},e.userWayMessage),{},Object(l.a)({},n,s))}}))},e.waymessageFormIsValid=function(){var t={username:e.state.userWayMessage.name,message:e.state.userWayMessage.message};return!I.validate(t).error},e.waymessageFormSubmit=function(t){t.preventDefault(),e.waymessageFormIsValid()&&(e.setState({sendingWayMessage:!0}),fetch(N,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({username:e.state.userWayMessage.name,message:e.state.userWayMessage.message,latitude:e.state.userPosition.lat,longitude:e.state.userPosition.lng})}).then((function(e){return e.json()})).then((function(t){console.log(t),setTimeout((function(){e.setState({sendingWayMessage:!1,sentWayMessage:!0})}),0)})))},e}return Object(d.a)(a,[{key:"componentDidMount",value:function(){var e=Object(u.a)(c.a.mark((function e(){var t,a,n=this;return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch("/isLoggedIn",{method:"post",headers:{Accept:"application/json","Content-Type":"application/json"}});case 3:return t=e.sent,e.next=6,t.json();case 6:(a=e.sent)&&a.success?(C.loading=!1,C.isLoggedIn=!0,C.username=a.username):(C.loading=!1,C.isLoggedIn=!1,C.username=""),e.next=14;break;case 10:e.prev=10,e.t0=e.catch(0),C.loading=!1,C.isLoggedIn=!1;case 14:fetch(S).then((function(e){return e.json()})).then((function(e){var t={};return e.reduce((function(e,a){var n="".concat(a.latitude.toFixed(3)).concat(a.longitude.toFixed(3));return t[n]?(t[n].otherWayMessages=t[n].otherWayMessages||[],t[n].otherWayMessages.push(a)):(t[n]=a,e.push(a)),e}),[])})).then((function(e){n.setState({waymessages:e})})),new Promise((function(e){navigator.geolocation.getCurrentPosition((function(t){e({lat:t.coords.latitude,lng:t.coords.longitude}),console.log("User location received... positioning map. "+t.coords.latitude+", "+t.coords.latitude)}),(function(){console.log("User location request denied... locating general location from ip adress."),fetch("https://ipapi.co/json").then((function(e){return e.json()})).then((function(t){e({lat:t.latitude,lng:t.longitude})}))}))})).then((function(e){n.setState({userPosition:e,hasUserPosition:!0,zoom:13})}));case 16:case"end":return e.stop()}}),e,null,[[0,10]])})));return function(){return e.apply(this,arguments)}}()},{key:"doLogout",value:function(){var e=Object(u.a)(c.a.mark((function e(){var t,a;return c.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.prev=0,e.next=3,fetch("/logout",{method:"post",headers:{Accept:"application/json","Content-Type":"application/json"}});case 3:return t=e.sent,e.next=6,t.json();case 6:(a=e.sent)&&a.success&&(C.isLoggedIn=!1,C.username=""),e.next=13;break;case 10:e.prev=10,e.t0=e.catch(0),console.log(e.t0);case 13:case"end":return e.stop()}}),e,null,[[0,10]])})));return function(){return e.apply(this,arguments)}}()},{key:"render",value:function(){var e=this;return C.loading?s.a.createElement("div",{className:"app"},s.a.createElement("div",{className:"container"},"Loading, please wait...")):C.isLoggedIn?s.a.createElement("div",{className:"app"},s.a.createElement("div",{className:"container"},"Welcome ",C.username,s.a.createElement(W,{text:"Logout",disabled:!1,onClick:function(){return e.doLogout()}}))):s.a.createElement("div",{className:"app"},s.a.createElement("div",{className:"container"},s.a.createElement(L,null)))}}]),a}(n.Component),P=Object(f.a)(F);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));r.a.render(s.a.createElement(s.a.StrictMode,null,s.a.createElement(P,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}},[[40,1,2]]]);
//# sourceMappingURL=main.c80f31b0.chunk.js.map