import React, {useContext, useState, useEffect} from 'react';
import {Route, Redirect} from "react-router-dom"
import {AuthContext } from "../contexts/AuthContext"

const ProtectedRoute = ({component: RouteComponent, ...rest}) => {
    
    const {currentUser} = useContext(AuthContext)
    const [render, setRender] = useState(false)

    useEffect(() => {
        setTimeout(() => {
            setRender(true)
        }, 500)
    }, [])

    return (
        <>
            {render && <Route
                {...rest}
                render={routeProps => 
                    !!currentUser ? (
                        <RouteComponent {...routeProps}/>
                    ) : (
                        <Redirect to="/login"/>
                    )
                }
            />}
        </>
    );
}

export default ProtectedRoute;
