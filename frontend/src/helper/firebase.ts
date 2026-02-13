import  firebase  from '@react-native-firebase/app';

export const firebaseInit = ()=>{
  if (!firebase.apps.length) {
    firebase.app();
  }
}
