import React, { Component } from "react";
import "./App.css";
import UploadDoc from "./uploadDocDragger";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadedList: []
    };
  }

  render() {
    const { uploadedList } = this.state;
    return (
      <div className="App">
        This is a test upload button using AWS and antd.
        <UploadDoc
          initialList={uploadedList}
          onDocsUploaded={(filename, list) => {
            console.log(list);
            this.setState({ uploadedList: list });
          }}
        />
      </div>
    );
  }
}

export default App;
