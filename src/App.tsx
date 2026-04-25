/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { FileUploader } from "./components/FileUploader";
import { CharacterSheet } from "./components/CharacterSheet";
import { parseFoundryJSON, ParsedCharacter } from "./lib/foundryParser";
import {
  Printer,
  RefreshCw,
  Upload,
  Loader2,
  AlertTriangle,
  Users,
} from "lucide-react";
import { characters } from "virtual:characters";

const characterCache: Record<string, ParsedCharacter> = {};

function preloadCharacter(id: string) {
  if (characterCache[id]) return;
  fetch(`/characters/${id}.json`)
    .then((res) => {
      if (!res.ok) throw new Error(`Could not find character: ${id}`);
      return res.json();
    })
    .then((json) => {
      characterCache[id] = parseFoundryJSON(json);
    })
    .catch((err) => console.error("Failed to preload:", err));
}

function RemoteCharacterLoader({
  setAppHeaderMode,
}: {
  setAppHeaderMode: (mode: "remote" | "local", charName?: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const [character, setCharacter] = useState<ParsedCharacter | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setAppHeaderMode("remote");

    if (characterCache[id]) {
      setCharacter(characterCache[id]);
      setAppHeaderMode("remote", characterCache[id].name);
      return;
    }

    // Fetch the JSON from the public/characters folder
    fetch(`/characters/${id}.json`)
      .then((res) => {
        if (!res.ok) throw new Error(`Could not find character: ${id}`);
        return res.json();
      })
      .then((json) => {
        const parsed = parseFoundryJSON(json);
        characterCache[id] = parsed;
        setCharacter(parsed);
        setAppHeaderMode("remote", parsed.name);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
      });
  }, [id, setAppHeaderMode]);

  if (error)
    return (
      <div className="p-8 text-center text-red-600 flex flex-col items-center justify-center gap-4 h-64">
        <AlertTriangle className="w-12 h-12" />
        {error}
      </div>
    );
   if (!character)
    return (
      <div className="p-12 text-center text-gray-500 flex flex-col items-center justify-center gap-4 h-64">
        /*<Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        Loading {id}...*/
      </div>
    );

  return <CharacterSheet char={character} />;
}

function MainUI() {
  const [character, setCharacter] = useState<ParsedCharacter | null>(null);
  const [appMode, setAppMode] = useState<"local" | "remote">("local");
  const [, setRemoteName] = useState<string | undefined>();
  const navigate = useNavigate();
  const location = useLocation();
  const currentId = location.pathname.substring(1);

  useEffect(() => {
    // Preload characters in background
    characters.forEach((c) => preloadCharacter(c.id));
  }, []);

  const handleFileUpload = (json: any) => {
    const parsed = parseFoundryJSON(json);
    setCharacter(parsed);
    setAppMode("local");
  };

  const setAppHeaderMode = (mode: "local" | "remote", name?: string) => {
    setAppMode(mode);
    if (name) setRemoteName(name);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (appMode === "remote") {
      navigate("/");
    } else {
      setCharacter(null);
    }
  };

  const handleSelectCharacter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    e.target.value = "";
    if (val === "upload") {
      handleReset();
    } else if (val) {
      if (appMode === "local") {
        setCharacter(null);
      }
      navigate(`/${val}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#d1d1d1]">
      {/* Top Banner (hidden during print) */}
      <header className="bg-dnd-ink text-dnd-parchment p-4 shadow-md no-print sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3" onClick={handleReset}>
            <div className="w-8 h-8 rounded bg-dnd-red flex items-center justify-center font-serif font-bold text-xl">
              D
            </div>
            <h1 className="text-xl font-serif font-bold tracking-wider uppercase text-white/90 hidden sm:block">
              Foundry 5e Extractor
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {(character || appMode === "remote") && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                title="Print or Save as PDF"
              >
                <Printer size={16} />{" "}
                <span className="hidden sm:inline">Print / Save PDF</span>
              </button>
            )}

            {(character || appMode === "remote") && (
              <select
                onChange={handleSelectCharacter}
                className="bg-[#2a2c35] hover:bg-[#343642] border border-gray-600 text-gray-200 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-dnd-red pr-8"
                defaultValue=""
              >
                <option value="" disabled className="text-gray-400 bg-gray-900">
                  Switch Character...
                </option>
                {characters
                  .filter((c) => c.id !== currentId)
                  .map((c) => (
                    <option
                      key={c.id}
                      value={c.id}
                      className="text-gray-200 bg-gray-900"
                    >
                      {c.name || c.id}
                    </option>
                  ))}
                {appMode === "remote" && (
                  <option value="upload" className="text-gray-200 bg-gray-900">
                    Upload Local JSON...
                  </option>
                )}
              </select>
            )}
          </div>
        </div>
      </header>

      <main className="pb-12 print:pb-0">
        <Routes>
          {/* Dynamic route pointing to a JSON character */}
          <Route
            path="/:id"
            element={
              <RemoteCharacterLoader setAppHeaderMode={setAppHeaderMode} />
            }
          />
          <Route
            path="/foundry/:id"
            element={
              <RemoteCharacterLoader setAppHeaderMode={setAppHeaderMode} />
            }
          />

          {/* Default upload view */}
          <Route
            path="/"
            element={
              !character ? (
                <div className="pt-8 px-4 max-w-5xl mx-auto">
                  {characters.length > 0 && (
                    <div className="mb-12">
                      <h2 className="text-2xl font-serif font-bold mb-6 text-center text-dnd-darkred flex items-center justify-center gap-2">
                        <Users className="w-6 h-6" /> Available Characters
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {characters.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => navigate(`/${c.id}`)}
                            className="flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent hover:border-dnd-red rounded-xl shadow-md hover:shadow-xl transition-all group cursor-pointer"
                          >
                            <span className="text-2xl font-serif font-bold text-dnd-ink group-hover:text-dnd-darkred mb-2 text-center h-16 flex items-center">
                              {c.name || c.id}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(c.updatedAt).toLocaleDateString()}{" "}
                              {new Date(c.updatedAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="w-full border-t border-gray-400/50"></div>
                    </div>
                    <div className="relative flex justify-center mb-8">
                      <span className="px-4 bg-[#d1d1d1] text-sm font-serif font-bold text-gray-500 uppercase tracking-widest">
                        Or Upload Local
                      </span>
                    </div>
                  </div>

                  <FileUploader onFileUpload={handleFileUpload} />

                  <div className="max-w-2xl mx-auto mt-12 p-6 bg-white/50 backdrop-blur border border-gray-300 rounded shadow-sm hidden">
                    <h2 className="text-lg font-serif font-bold mb-3 text-dnd-darkred">
                      Hosting Characters on GitHub Pages?
                    </h2>
                    <p className="text-sm text-gray-700 mb-2">
                      You can organize a workflow to automatically generate
                      separate pages for your characters:
                    </p>
                    <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1.5 ml-2">
                      <li>
                        In your Git repository, place all your exported Foundry
                        JSON files into a{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          public/characters/
                        </code>{" "}
                        folder.
                      </li>
                      <li>
                        This app has dynamic routing built-in! If you navigate
                        to{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          /charactername
                        </code>{" "}
                        (e.g. your URL{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          /foundry/charactername
                        </code>
                        ), it will automatically load{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          public/characters/charactername.json
                        </code>
                        .
                      </li>
                      <li>
                        Setup a GitHub Actions workflow to run{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          npm run build
                        </code>{" "}
                        and deploy the{" "}
                        <code className="bg-gray-200 px-1 rounded">dist</code>{" "}
                        folder to the{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          gh-pages
                        </code>{" "}
                        branch.
                      </li>
                      <li>
                        <b>Crucial GitHub Pages Trick:</b> Because it's a Single
                        Page Application, copy your{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          dist/index.html
                        </code>{" "}
                        to{" "}
                        <code className="bg-gray-200 px-1 rounded">
                          dist/404.html
                        </code>{" "}
                        as part of your deployment script so direct links don't
                        throw 404s.
                      </li>
                    </ol>
                  </div>
                </div>
              ) : (
                <CharacterSheet char={character} />
              )
            }
          />
        </Routes>
      </main>

      <footer className="text-center pb-8 pt-12 text-gray-600 text-sm no-print">
        <p>
          This tool is not affiliated with, endorsed, sponsored, or specifically
          approved by Wizards of the Coast LLC.
        </p>
        <p>Built for Foundry VTT dnd5e system exported JSON data.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <MainUI />
    </HashRouter>
  );
}
