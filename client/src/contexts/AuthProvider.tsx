import React, { useState } from "react";
import { api } from "../services/api";
import { AuthContext, type User } from "./AuthContext";

/**
 * Authentication Provider.
 * It wraps an application to provide global login state,
 * logged-in user data, and session methods (signIn, signOut).
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Retrieves the JWT token and user data string directly from the browser.
  const storedToken = localStorage.getItem("@agroflow:token");
  const storedUser = localStorage.getItem("@agroflow:user");

  // Self-executing block (IIFE) that validates whether local credentials are valid.
  const parsedUser = (() => {
    if (storedToken && storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch {
        localStorage.removeItem("@agroflow:token");
        localStorage.removeItem("@agroflow:user");
        return null;
      }
    }
    return null;
  })();

  // Initializes the user state with the result of parsing localStorage.
  const [user, setUser] = useState<User | null>(parsedUser);
  const [loading] = useState(false);

  /**
   * Logout.
   * Clears credentials saved in the browser and resets the user state to null,
   * forcing an immediate redirect to the login screen.
   */
  const signOut = () => {
    localStorage.removeItem("@agroflow:token");
    localStorage.removeItem("@agroflow:user");
    setUser(null);
  };

  /**
   * Check registration.
   * Sends the entered employee ID to the backend to validate if the employee exists.
   * Returns the user's name associated with that ID.
   */
  const checkRegistration = async (registration: string) => {
    const response = await api.post("/login/check-registration", { registration });
    return response.data;
  };

  /**
   * Login.
   * Sends the provided ID and password to the backend for final authentication.
   */
  const signIn = async (registration: string, password: string) => {
    const response = await api.post("/login", { registration, password });
    const { token, id, name, role, city } = response.data;

    const userData: User = { id, name, role, city };

    localStorage.setItem("@agroflow:token", token);
    localStorage.setItem("@agroflow:user", JSON.stringify(userData));

    setUser(userData);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        checkRegistration,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
