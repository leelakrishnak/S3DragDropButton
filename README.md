This is a React web app created using create-react-app based on Antd (https://ant.design/)

This is a Drag and drop upload button linked to AWS s3 API, this looks like below in the webpage

<img width="923" alt="Screen Shot 2019-03-14 at 11 34 43 PM" src="https://user-images.githubusercontent.com/6565989/54413060-c896ea00-46b1-11e9-8bc4-f6ca6dc27dcc.png">



It is a simple custom component, this component is used like this.

  <UploadDoc
    initialList={uploadedList}
    onDocsUploaded={(filename, list) => {
      console.log(list);
    }}
  />


#Run the app using following command
  yarn start

