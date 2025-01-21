import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const MainPage = ({ sentimentResult }) => {
  // Check if sentimentResult is valid and has the necessary properties
  const isSentimentValid = sentimentResult && sentimentResult.sentiment && sentimentResult.response;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Mental Well-being Resources</h2>

      {/* Sentiment analysis result */}
      <div className="row mb-4">
        <div className="col-12">
          {isSentimentValid ? (
            <div
              className={`card shadow-sm p-4 ${
                sentimentResult.sentiment === 'POSITIVE'
                  ? 'border-success'
                  : sentimentResult.sentiment === 'NEGATIVE'
                  ? 'border-danger'
                  : 'border-secondary'
              }`}
            >
              <h4 className="card-title">Sentiment Analysis Result</h4>
              <p className="card-text">
                <strong>Sentiment:</strong> {sentimentResult.sentiment}
              </p>
              <p className="card-text">
                <strong>Response:</strong> {sentimentResult.response}
              </p>
            </div>
          ) : (
            <div className="alert alert-warning">Sentiment analysis is not possible at the moment.</div>
          )}
        </div>
      </div>

      {/* Resources Section */}
      <h3 className="text-center mb-4">Explore Mental Health Resources</h3>

      <div className="row">
        {/* Videos */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <img
              src="https://www.youtube.com/watch?v=G0M41N1Lyw4"
              alt="Video"
              className="card-img-top"
            />
            <div className="card-body">
              <h5 className="card-title">Mental Health Awareness Video</h5>
              <p className="card-text">
                Watch this video to learn more about mental health awareness.
              </p>
              <a href="https://www.youtube.com/watch?v=G0M41N1Lyw4" className="btn btn-primary">
                Watch Now
              </a>
            </div>
          </div>
        </div>

        {/* Blogs */}
        <div className="col-md-4 mb-4">
          <div className="card">
            <img
              src="https://in.video.search.yahoo.com/search/video;_ylt=AwrKCZznSY9nLAIAW3G7HAx.;_ylu=Y29sbwNzZzMEcG9zAzEEdnRpZAMEc2VjA3Nj?type=E211IN105G0&p=blogs+of+mental+health&fr=mcafee&turl=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOVP.ugAz2fWI6SzzsdiqhqsPQQEsDI%26pid%3DApi%26w%3D296%26h%3D156%26c%3D7%26p%3D0&rurl=https%3A%2F%2Fwww.verywellmind.com%2Fthe-best-mental-health-blogs-5205192&tit=Mental+Health+Blogs%3A+Here+are+the+Best+Ones+to+Follow&pos=11&vid=7016102ce113052a914b0601bdcb0374&sigr=jTi25l2J2c0O&sigt=EjxjzaDY6Mcj&sigi=T.MU4VFCsZB4"
              alt="Blog"
              className="card-img-top"
            />
            <div className="card-body">
              <h5 className="card-title">Understanding Mental Health</h5>
              <p className="card-text">
                Read this insightful blog on understanding the basics of mental health.
              </p>
              <a href="#" className="btn btn-primary">
                Read Blog
              </a>
            </div>
          </div>
        </div>

        {/* Books */}
        <div className="col-md-4 mb-4">
          <div className="card">
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
              <a href="#" className="btn btn-primary">
                Buy Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="text-center">
        <p className="lead">
          Explore more resources to support your mental health journey.
        </p>
        <a href="#" className="btn btn-link">See more resources</a>
      </div>
    </div>
  );
};

export default MainPage;
