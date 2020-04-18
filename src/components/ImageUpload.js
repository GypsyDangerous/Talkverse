import React, { useRef, useState, useEffect, useCallback } from 'react';
import './ImageUpload.css';
import firebase from "../firebase"

const ImageUpload = props => {
  const [file, setFile] = useState();
  const [previewUrl, setPreviewUrl] = useState();

  const filePickerRef = useRef();

  useEffect(() => {
    if(props.value){
      setPreviewUrl(props.value)
    }
  }, [props])

  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewUrl(fileReader.result);
    };
    fileReader.readAsDataURL(file);
  }, [file]);

  const pickedHandler = async event => {
    let pickedFile = file;
    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
    }
    const storageRef = firebase.storage.ref();
    const fileRef = storageRef.child([...Array(10)].map(_ => (Math.random() * 36 | 0).toString(36)).join`` + pickedFile.name);
    await fileRef.put(pickedFile)
    const url = await fileRef.getDownloadURL()
    await firebase.db.collection("users").doc(firebase.auth.currentUser.uid).update({
      profilePicture: url
    })
  };

  const pickImageHandler = useCallback(() => {
    filePickerRef.current.click();
  },[])

  return (
    <div>
      <input
        id={props.id}
        ref={filePickerRef}
        style={{ display: 'none' }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickedHandler}
      />
      <div className={`image-upload ${props.center && 'center'}`} >
        <div onClick={pickImageHandler} className="image-upload__preview" style={props.style}>
          {previewUrl && <img className={props.className} src={previewUrl} alt="Preview" />}
          {!previewUrl && <p>Please pick an image.</p>}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
