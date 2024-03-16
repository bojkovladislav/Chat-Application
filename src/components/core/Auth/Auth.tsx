import { FC, FormEvent, useState } from "react";

interface Props {
  createUser: (name: string) => void;
}

const Auth: FC<Props> = ({ createUser }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!name.length) {
      setError("Username is required!");

      return;
    }

    setIsLoading(true);
    createUser(name);
  };

  const handleInputChange = (value: string) => {
    setName(value);
    setError("");
  };

  return (
    <div className="flex max-w-[300px] flex-col gap-5 rounded-md border-2 p-5 md:max-w-[500px] md:p-8">
      <form
        className="flex flex-col gap-5 md:flex-row md:gap-10"
        onSubmit={handleSubmit}
      >
        <div className="relative">
          <input
            className="input"
            placeholder="Enter your username"
            value={name}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {error && (
            <p className="absolute top-11 text-sm font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>

        <button className="button bg-blue-500" type="submit">
          {`${isLoading ? "Working on it..." : "Log in"}`}
        </button>
      </form>

      <p className="text-sm">
        <span className="text-yellow-300">Note:</span> Initial loading time may
        be slightly longer than usual due to the limitations of my server, which
        is hosted for free.
      </p>
    </div>
  );
};

export default Auth;
