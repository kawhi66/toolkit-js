<script>
export default {
  data() {
    return {
      abc: 'demo',
    };
  },
  render: function (h) {
    return <h1>Hello, {this.abc}</h1>;
  },
};
</script>
