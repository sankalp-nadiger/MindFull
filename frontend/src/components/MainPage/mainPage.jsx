import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from "react-router-dom";

const MainPage = ({ sentimentResult }) => {
  const isSentimentValid = sentimentResult && sentimentResult.sentiment && sentimentResult.response;

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column p-0">
      <header className="bg-primary text-white text-center py-4 mb-5">
        <h2>Mental Well-being Resources</h2>
      </header>

      <div className="row flex-grow-1">
        {/* Sentiment Analysis Section */}
        <div className="col-12 p-4">
          {isSentimentValid ? (
            <div
              className={`card shadow-sm p-4 ${sentimentResult.sentiment === 'POSITIVE' ? 'border-success' : sentimentResult.sentiment === 'NEGATIVE' ? 'border-danger' : 'border-secondary'}`}
            >
              <h4 className="card-title text-center mb-3">Sentiment Analysis Result</h4>
              <p className="card-text">
                <strong>Sentiment:</strong> {sentimentResult.sentiment}
              </p>
              <p className="card-text">
                <strong>Response:</strong> {sentimentResult.response}
              </p>
            </div>
          ) : (
            <div className="alert alert-warning text-center">
              <h5>Explore More Activities:</h5>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/activity" className="btn btn-info btn-lg">Activity</Link>
                <Link to="/journals" className="btn btn-info btn-lg">Journals</Link>
                <Link to="/createStory" className="btn btn-info btn-lg">Story</Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resources Section */}
      <div className="row flex-grow-1">
        <div className="col-12 p-4">
          <h3 className="text-center mb-4 text-success">Explore Mental Health Resources</h3>
          <div className="row">
            {/* Video Section */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <div className="embed-responsive embed-responsive-16by9">
                  <iframe
                    className="embed-responsive-item"
                    src="https://www.youtube.com/embed/G0M41N1Lyw4"
                    title="Mental Health Awareness Video"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="card-body">
                  <h5 className="card-title">Mental Health Awareness Video</h5>
                  <p className="card-text">
                    Watch this video to learn more about mental health awareness.
                  </p>
                  <a href="https://www.youtube.com/watch?v=G0M41N1Lyw4" className="btn btn-primary btn-lg w-100">
                    Watch Now
                  </a>
                </div>
              </div>
            </div>

            {/* Blog Section */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy8xODI5MjgzOS9vcmlnaW4uanBnIiwiZXhwaXJlc19hdCI6MTY3MzEyMTUwN30.w-l6w-FC2KIJgog2VP23F-n_QVxvVXSTCBrokDOyzqc/img.jpg?width=980"
                  alt="Mental Health Blog"
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">Understanding Mental Health</h5>
                  <p className="card-text">
                    Read this insightful blog on understanding the basics of mental health.
                  </p>
                  <a href="#" className="btn btn-primary btn-lg w-100">
                    Read Blog
                  </a>
                </div>
              </div>
            </div>

            {/* Book Section */}
            <div className="col-md-4 mb-4">
              <div className="card h-100 shadow-sm">
                <img
                  src="https://assets.rebelmouse.io/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpbWFnZSI6Imh0dHBzOi8vYXNzZXRzLnJibC5tcy8xODI5MjgzOS9vcmlnaW4uanBnIiwiZXhwaXJlc19hdCI6MTY3MzEyMTUwN30.w-l6w-FC2KIJgog2VP23F-n_QVxvVXSTCBrokDOyzqc/img.jpg?width=980"
                  alt="Book"
                  className="card-img-top"
                />
                <div className="card-body">
                  <h5 className="card-title">The Power of Now</h5>
                  <p className="card-text">
                    This book explores the connection between mindfulness and mental well-being.
                  </p>
                  <a href="#" className="btn btn-primary btn-lg w-100">
                    Buy Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="text-center my-5">
        <h4 className="text-info">Chat with our Mental Health Support Bot</h4>
        <a href="https://huggingface.co/spaces/vaibhav2154/MindFullBot" className="btn btn-info btn-lg">
          Start Chat
        </a>
      </div>

      {/* Games Section */}
      <div className="my-5 text-center">
        <h4 className="text-warning">Play the Mental Wellness Crossword Game</h4>
        <Link to="/crossword" className="btn btn-info btn-lg mx-2">
          Start Game
        </Link>
        <h4 className="text-warning mt-4">Play the Mental Wellness Sudoku Game</h4>
        <Link to="/Sudoku" className="btn btn-info btn-lg mx-2">
          Start Game
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <p>&copy; 2025 Mental Well-being Resources</p>
      </footer>
    </div>
  );
};

export default MainPage;
