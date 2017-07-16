import * as express from 'express';
import * as session from 'express-session';
import {renderVM} from './vm';

export function start(port = 3000) {
  const app = express();

  app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  }));

  app.use('/', (req, res) => {
    if (!req.session.visitCount) {
      req.session.visitCount = 0;
    }

    req.session.visitCount++;

    res.send(renderVM('./src/test-setup/test.vm', {
      baseStaticUrl: '//localhost:3200/',
      debug: true
    }));
  });

  return app.listen(port, () => {
    console.log(`Fake server is running on port ${port}`);
  });
}
