import React, { Component } from "react";
import { Upload, Button, Icon, Col, Row, message } from "antd";
import PropTypes from "prop-types";
import "./uploadDocDragger.css";
import axios from "axios";
import "antd/dist/antd.css";

const Dragger = Upload.Dragger;
const instance = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 1000
});

class UploadDoc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showProgress: false
    };
    message.config({
      top: 100,
      duration: 2,
      maxCount: 1
    });
  }

  downloadFile(file) {
    message.loading("Downloading...", 0);

    // Get temporary signed AWS URL and download the file directly from the browser
    instance
      .get("/getdownloadurl", {
        params: {
          bucketName: file.bucketName,
          key: file.key
        }
      })
      .then(res => {
        if (res.data.result !== "success") {
          throw new Error({ result: "failed" });
        }
        return axios({
          url: res.data.url,
          method: "GET",
          responseType: "blob" // important
        });
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", file.originalName);
        document.body.appendChild(link);
        link.click();
        message.success("Downloading completed");
      })
      .catch(error => {
        message.error("Download failed try again");
        console.log(error);
      });
  }

  uploadFileToAWS(file, info, onProgress) {
    let promise = new Promise((resolve, reject) => {
      let uploadedFile = {
        originalName: file.name,
        size: file.size,
        mimeType: file.type,
        bucketName: info.bucketName,
        key: info.name,
        uid: file.uid
      };

      // upload file to AWS directly using signed URL that we got from server
      axios
        .put(info.url, file, {
          headers: {
            "Content-Type": file.type
          },
          onUploadProgress: ({ total, loaded }) => {
            onProgress(
              { percent: Math.round((loaded / total) * 100).toFixed(2) },
              file
            );
          }
        })
        .then(result => {
          resolve(uploadedFile);
        })
        .catch(error => {
          reject(error);
        });
    });
    return promise;
  }

  deleteFile(file) {
    // Delete the object from the AWS.
    instance
      .get("/getdownloadurl", {
        params: {
          bucketName: file.bucketName,
          key: file.key
        }
      })
      .then(result => {
        console.log("file deleted successfully");
      })
      .catch(error => {
        console.log(error);
      });
  }

  render() {
    const thisobj = this;
    const { initialList } = this.props;

    const uploadProps = {
      name: "file",
      multiple: false,
      showUploadList: false,
      beforeUpload(file) {
        // Limit on the size and number of files
        // if (initialList.length > 3) {
        //   message.error("Cannot upload more than 3 pages!");
        //   return false;
        // }
        // const isLt5M = file.size / 1024 / 1024 < 5;
        // if (!isLt5M) {
        //   message.error("Image must be smaller than 5MB!");
        //   return false;
        // }
        return true;
      },
      onChange(info) {
        const status = info.file.status;
        if (status === "uploading") {
          const percent = info.event ? parseInt(info.event.percent, 10) : 0;
          message.loading("uploading.." + percent + "%", 0);
        } else if (status === "done") {
          message.success(`${info.file.name} file uploaded successfully.`);
        } else if (status === "error") {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
      customRequest({
        action,
        data,
        file,
        filename,
        headers,
        onError,
        onProgress,
        onSuccess,
        withCredentials
      }) {
        //Get temporay AWS upload URL from the server
        instance
          .get("/getuploadurl", {
            params: {
              name: file.name,
              type: file.type
            }
          })
          .then(res => {
            if (res.data.result !== "success") {
              throw new Error({ result: "failed" });
            }
            return thisobj.uploadFileToAWS(file, res.data.info, onProgress);
          })
          .then(result => {
            onSuccess("uploaded successfully", file);
            thisobj.props.onDocsUploaded(file.name, [...initialList, result]);
          })
          .catch(error => {
            console.log(JSON.stringify(error));
            onError("Upload failed.");
          });
      }
    };

    return (
      <div>
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <Icon type="inbox" />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
        </Dragger>

        {initialList &&
          initialList.map((file, index) => {
            return (
              <div key={index} className="docs-container">
                <Row key={index} gutter={10}>
                  <Col span={20}>
                    <Icon type="paper-clip" />
                    <a onClick={() => this.downloadFile(file)}>
                      {file.originalName.length > 25
                        ? `${file.originalName.slice(0, 25)}...`
                        : file.originalName}
                    </a>
                  </Col>
                  <Col span={2}>
                    <Button
                      onClick={() => {
                        this.deleteFile(initialList[index]);
                        let list = initialList.filter(
                          (file, currindex) => currindex !== index
                        );
                        this.props.onDocsUploaded(file.originalName, list);
                      }}
                      shape="circle"
                      icon="close"
                    />
                  </Col>
                  <Col span={2}>
                    <Button
                      onClick={() => {
                        this.downloadFile(initialList[index]);
                      }}
                      shape="circle"
                      icon="download"
                    />
                  </Col>
                </Row>
              </div>
            );
          })}
      </div>
    );
  }
}

UploadDoc.propTypes = {
  keyName: PropTypes.string,
  initialList: PropTypes.arrayOf(PropTypes.object),
  onDocsUploaded: PropTypes.func.isRequired
};
export default UploadDoc;
