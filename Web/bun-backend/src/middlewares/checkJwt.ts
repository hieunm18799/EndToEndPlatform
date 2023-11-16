import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import config from "../config/config";

export const checkJwtUser = (req: Request, res: Response, next: NextFunction) => {
  //Try to validate the token and get data
  try {
    //Get the jwt token from the head
    const { iat, exp, ...userInfor } = <any>jwt.verify(<string>req.headers['x-jwt-user'], config.jwtSecret)
    res.locals[config.middle_val.userInfor] = userInfor;
    console.log(userInfor)
    
      //The token is valid for 1 hour
      //We want to send a new token on every request
      const newToken = jwt.sign(userInfor, config.jwtSecret, {
        expiresIn: config.jwtExpiresTime
      });
      res.setHeader("x-jwt-user", newToken);
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }

  //Call the next middleware or controller
  next();
};

export const checkJwtProject = (req: Request, res: Response, next: NextFunction) => {
  //Try to validate the token and get data
  try {
    //Get the jwt token from the head
    const token = <string>req.headers['x-jwt-project'];
    const { iat, exp, ...projectInfor} = <any>jwt.verify(token, config.jwtSecret);
    res.locals[config.middle_val.projectInfor] = projectInfor;
    //The token is valid for 1 hour
    //We want to send a new token on every request
    // const { email, projectId } = projectInfor;
    const newToken = jwt.sign(projectInfor, config.jwtSecret, {
      expiresIn: config.jwtExpiresTime
    });
    res.setHeader('x-jwt-project', newToken);
  } catch (error) {
    //If token is not valid, respond with 401 (unauthorized)
    res.status(401).send();
    return;
  }


  //Call the next middleware or controller
  next();
};