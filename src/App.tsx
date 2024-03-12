import React from "react";
import { useStore } from "zustand";
import { useFetch, useMutate } from "./useFetch";
import { authStore, logout } from "./authStore";

const App = () => {
  const { accessToken, refreshToken } = useStore(authStore);

  const login = useMutate("/login", {
    onSuccess: (data) => {
      console.log("Login success!", data);
      authStore.setState({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
  });

  const user = useFetch("/user", {
    enabled: !!accessToken,
    select: (i) => i.result,
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    login.mutate({ username, password });
  };

  return (
    <div className="container" style={{ padding: "8rem 1rem" }}>
      {!accessToken ? (
        <section>
          <h1>Login</h1>

          {login.error ? <p>{login.error.message}</p> : null}

          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username"
              style={{ width: 300 }}
            />
            <br />
            <input
              type="password"
              name="password"
              placeholder="Password"
              style={{ width: 300 }}
            />
            <br />
            <button type="submit">Login</button>
          </form>
        </section>
      ) : (
        <section>
          <h1>Profile</h1>
          <p>Access token: {accessToken}</p>
          <p>Refresh token: {refreshToken}</p>
          <p>User Data:</p>
          {user.isLoading ? (
            <p>Loading...</p>
          ) : user.error ? (
            <p>{user.error?.message}</p>
          ) : user.data ? (
            <div>
              <p>
                Token Expire date:{" "}
                {new Date(user.data.exp * 1000).toISOString()}
              </p>
              <pre>{JSON.stringify(user.data, null, 2)}</pre>
            </div>
          ) : null}
          <button onClick={user.refetch}>Refetch</button>&nbsp;
          <button onClick={logout}>Logout</button>
        </section>
      )}
    </div>
  );
};

export default App;
