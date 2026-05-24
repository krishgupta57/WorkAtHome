import { createContext, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials, logout as logoutAction, updateUser } from "../store/slices/authSlice";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  const login = (userData, access) => {
    dispatch(setCredentials({ user: userData, access }));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  const update = (updatedData) => {
    dispatch(updateUser(updatedData));
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, update }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;