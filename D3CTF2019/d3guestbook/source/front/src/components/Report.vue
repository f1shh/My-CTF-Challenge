<template>
  <el-row id="main" type="flex" justify="center" align="middle">
    <el-col :span="12">
      <el-card class="box-card">
        <p class="msg">If you find a vulnerability on the website, please submit the vulnerable URL to the admin.</p>
        <el-form ref="form" :model="form" label-width="30px">
          <el-input type="hidden" name="token" v-model="form.token"></el-input>
          <el-form-item label="Url">
            <el-input name="url" v-model="form.url" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-row :gutter="20">
              <el-col :span="10">
            <el-input v-model="form.code" :placeholder="form.verification"></el-input>
            </el-col>
            <el-button type="primary" @click="onSubmit">Submit</el-button>
            </el-row>
          </el-form-item>
        </el-form>
        <p class="msg" style="color: #fd0000">{{ message }}</p>
      </el-card>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'Report',
  data() {
    return {
      message: '',
      form: {
        verification: '',
        code: '',
        url: '',
        token: decodeURIComponent(document.cookie.substr(7))
      }
    }
  },
  methods: {
    onSubmit() {
      if(this.form.url != '') {
        let data = {
          url: this.form.url,
          code: this.form.code,
          token: this.form.token
        };
        this.$http.post('/api/report', data, {credentials: true}).then(resp => {
          return resp.json();
        }).then(resp => {
          this.message = resp.ret_msg;
          this.form.verification = resp.verification;
          this.form.code = '';
          this.form.url = '';
        });
      }
    },
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
    this.$http.post('/api/report', {credentials: true}).then(resp => {
      return resp.json();
    }).then(resp => {
      this.form.verification = resp.verification;
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.msg {
  margin-top: 0px;
  margin-bottom: 0px;
  font-weight: normal;
  color: #303133;
}
.box-card {
  background-color: rgba(212, 211, 211, 0.6);
}
</style>
