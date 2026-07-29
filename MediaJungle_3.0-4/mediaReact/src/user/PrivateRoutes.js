import { Outlet, Navigate } from 'react-router-dom'

const PrivateRoutes = () => {
    // sessionStorage.setItem("name",false);
    const a= sessionStorage.getItem('name');
    var b = a==='true'? true:false;
    // var b = false;
    // console.log(a===true? true:false);
    const auth = {'token':true}
    // console.log("auth")
    // console.log(b)
    // console.log(a)
    // console.log(typeof b)

    return(
        // b===false? <Outlet/> : <Navigate to="/login"/>
        b ? <Outlet /> :<Navigate to="/admin" /> 
    )
}

export default PrivateRoutes