<template>
  <el-row id="main" type="flex" justify="center" align="middle">
    <el-card class="box-card">
      <el-row>
        <el-form id="loginForm" label-position="right" label-width="70px" :model="loginForm">
          <el-input type="hidden" name="token" v-model="loginForm.token"></el-input>
          <el-form-item label="Username">
            <el-input name="username" v-model="loginForm.username" clearable></el-input>
          </el-form-item>
          <el-form-item label="Password">
            <el-input name="password" type="password" v-model="loginForm.password" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="login">Login</el-button><el-button @click="register">Register</el-button>
          </el-form-item>
        </el-form>
        <p class="msg">{{ message }}</p>
      </el-row>
    </el-card>
  </el-row>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      message: '',
      loginForm: {
        username: '',
        password: '',
        token: decodeURIComponent(document.cookie.substr(7))
      }
    }
  },
  methods: {
    login() {
      if(this.loginForm.username != '' && this.loginForm.password != '') {
        let data = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          token: this.loginForm.token
        };
        this.$http.post('/api/login', data, {credentials: true}).then(resp => {
          return resp.json();
        }).then(resp => {
          if(resp.ret_code === 0) {
            this.$router.push('/');
          } else {
            this.message = resp.ret_msg;
          }
        });
      } else {
        if(this.loginForm.username === '') {
          this.message = 'Username cannot be empty.';
        } else if(this.loginForm.password === '') {
          this.message = 'Password cannot be empty.';
        }
      }
    },
    register() {
      if(this.loginForm.username != '' && this.loginForm.password != '') {
        let data = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          token: this.loginForm.token
        }
        this.$http.post('/api/register', data, {credentials: true}).then(resp => {
          return resp.json();
        }).then(resp => {
          if(resp.ret_code === 0) {
            this.message = 'Register success. Please login.'
          } else {
            this.message = resp.ret_msg;
          }
        });
      } else {
        if(this.loginForm.username === '') {
          this.message = 'Username cannot be empty.';
        } else if(this.loginForm.password === '') {
          this.message = 'Password cannot be empty.';
        }
      }
    }
  },
  mounted: function () {
    var h = document.documentElement.clientHeight - 80;
    var value = "height: " + h + "px;";
    document.getElementById("main").setAttribute('style', value);
    window.onresize = function () {
      var h = document.documentElement.clientHeight - 80;
      var value = "height: " + h + "px;";
      document.getElementById("main").setAttribute('style', value);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.msg {
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: normal;
  color: #fd0000;
}
.box-card {
  background-color: rgba(212, 211, 211, 0.6);
}
</style>
