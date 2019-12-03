<template>
  <el-row type="flex" justify="center" align="middle">
    <el-col :span="12">
      <el-container>
        <el-header>
          <el-row>
            <el-col :span="20">
              <el-menu router mode="horizontal" class="box-card" text-color="#303133">
                <el-menu-item>Guestbook</el-menu-item>
                <el-menu-item index="report">Report</el-menu-item>
              </el-menu>
            </el-col>
            <el-col :span="4">
              <el-menu router mode="horizontal" class="box-card" text-color="#303133">
                <el-menu-item v-show="isLogin">{{ username }}</el-menu-item>
                <el-menu-item index="login" v-show="!isLogin">Login</el-menu-item>
              </el-menu>
            </el-col>
          </el-row>
        </el-header>
        <el-main>
          <el-card class="box-card">
            <div slot="header" class="clearfix">
              <span>Your message</span>
            </div>
            <el-scrollbar wrap-style="height: 400px;">
              <div v-for="message in messages" class="text item">
                <el-row :gutter="10">
                  <el-col :span=22>
                    <span v-html="message.content"></span>
                  </el-col>
                  <el-col :span=2>
                    <el-button type="danger" icon="el-icon-delete" circle @click="onDelete(message.id)"></el-button>
                  </el-col>
                </el-row>
              </div>
            </el-scrollbar>
          </el-card>
        </el-main>
        <el-footer>
          <el-card class="box-card">
            <el-form id="messageForm" ref="form" :model="form" label-width="80px">
              <el-input type="hidden" name="token" v-model="form.token"></el-input>
              <el-form-item label="Message">
                <el-input type="textarea" v-model="form.message"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="onSubmit">Submit</el-button>
                <el-button native-type="reset">Reset</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-footer>
      </el-container>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      isLogin: false,
      messages: [],
      username: '',
      form: {
        message: '',
        token: decodeURIComponent(document.cookie.substr(7))
      }
    }
  },
  methods: {
    onSubmit() {
      if(this.form.message != '') {
        let data = {
          content: this.form.message,
          token: this.form.token
        };
        this.$http.post('/api/post', data, {credentials: true}).then(resp => {
          return resp.json();
        }).then(resp => {
          if(resp.ret_code === 0) {
            this.$http.get('/api/posts', {credentials: true}).then(resp => {
              return resp.json();
            }).then(resp => {
              if(resp.ret_code === 0) {
                this.messages = resp.data;
                this.form.message = '';
              }
            });
          }
        });
      }
    },
    onDelete(id){
      this.messages = []
      this.$router.push({
        name: 'Index',
        query: {
          did: id
        }
      });
    },
    updateMessage() {
      var post_url = '/api/posts';
      if(this.$route.query.pid) {
        post_url = `/api/post/${this.$route.query.pid}`;  // Only admin can view other user's messages
      }
      this.$http.get(post_url, {credentials: true}).then(resp => {
        return resp.json();
      }).then(resp => {
        if(resp.ret_code === 0) {
          this.messages = resp.data;
        }
      });     
    }
  },
  beforeCreate: function () {
    this.$http.get('/api/user', {credentials: true}).then(resp => {
      return resp.json();
    }).then(resp => {
      if(resp.ret_code === 0) {
        this.isLogin = true;
        this.username = resp.user.username;
        this.updateMessage();
      }
    });
    window.updateMessage = this.updateMessage;
  },
  updated: function () {
    if(this.$route.query.did) {
      this.$http.jsonp('/api/post/' + this.$route.query.did + '/delete?callback=updateMessage', {credentials: true}).then(resp => {}, err => {});
      this.$router.push('/');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.box-card {
  background-color: rgba(212, 211, 211, 0.6);
}
.text {
  font-size: 14px;
}
.item {
  margin-bottom: 18px;
}
.el-scrollbar__wrap {
  overflow: visible;
  overflow-x: hidden;
}
</style>
