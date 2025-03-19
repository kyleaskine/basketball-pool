import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { updateServices, Update } from "../services/api";

const HomePage: React.FC = () => {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const data = await updateServices.getUpdates();
        setUpdates(data);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching updates:", err);
        setError("Failed to load the latest updates");
        setIsLoading(false);
      }
    };

    fetchUpdates();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get update type color and icon
  const getUpdateTypeInfo = (type: string) => {
    switch (type) {
      case "announcement":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
              />
            </svg>
          ),
        };
      case "reminder":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
        };
      default: // news
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          ),
        };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <div className="bg-blue-800 text-white rounded-lg shadow-xl overflow-hidden mb-12">
          <div className="md:flex">
            <div className="p-8 md:w-2/3">
              <h1 className="text-4xl font-bold mb-4">Kyle's Basketball Pool 2025</h1>
              <p className="text-xl mb-6">
                Join the excitement of college basketball's biggest tournament!
                Fill out your bracket and compete with friends, family, and
                colleagues.
              </p>
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 rounded mb-6">
                <p className="font-medium">
                  Entry Deadline: March 20, 2025 at 12:00 PM ET
                </p>
              </div>
              <Link
                to="/entry"
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-blue-900 font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
              >
                Fill Out Your Bracket Now
              </Link>
            </div>
            <div className="md:w-1/3 bg-blue-900 flex items-center justify-center p-8">
              <img
                src="/images/basketball-hoop.jpg"
                alt="Basketball Tournament"
                className="w-full h-auto rounded shadow"
              />
            </div>
          </div>
        </div>

        {/* Updates Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Latest Updates
          </h2>

          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          ) : updates.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center">
              <p className="text-gray-600">
                No updates available at this time.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => {
                const { color, icon } = getUpdateTypeInfo(update.type);

                return (
                  <div
                    key={update._id}
                    className={`border ${color} rounded-lg shadow-sm p-5`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center mb-2">
                        {icon}
                        <span className="font-semibold">{update.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatDate(update.createdAt)}
                      </span>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <div
                        dangerouslySetInnerHTML={{ __html: update.content }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Fill Out Your Bracket
              </h3>
              <p className="text-gray-600 text-center">
                Predict winners for all 63 tournament games, from the First
                Round to the Championship.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Submit Before Deadline
              </h3>
              <p className="text-gray-600 text-center">
                All brackets must be submitted by March 20, 2025 at 12:00 PM ET,
                before the tournament begins.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 text-blue-800 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-lg font-semibold text-center mb-2">
                Track Your Progress
              </h3>
              <p className="text-gray-600 text-center">
                Follow along as the tournament unfolds and see how your
                predictions stack up!
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-100 rounded-lg p-8 text-center mb-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Make Your Picks?</h2>
          <p className="text-lg text-gray-700 mb-6">
            Don't miss out on the excitement of March Madness 2025!
          </p>
          <Link
            to="/entry"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors"
          >
            Fill Out Your Bracket Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
