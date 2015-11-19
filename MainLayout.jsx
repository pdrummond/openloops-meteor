MainLayout = React.createClass({
  render() {
    return (
      <div className="react-app" style={{height:'100%'}}>
        <main style={{height:'100%'}}>{this.props.content}</main>
      </div>
    );
  }
});
