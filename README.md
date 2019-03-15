This is a React web app created using create-react-app based on Antd (https://ant.design/)

This is a Drag and drop upload button linked to AWS s3 API.

It is a simple custom component, this component is used like this.

  <UploadDoc
    initialList={uploadedList}
    onDocsUploaded={(filename, list) => {
      console.log(list);
    }}
  />


#Run the app using following command
  yarn start

