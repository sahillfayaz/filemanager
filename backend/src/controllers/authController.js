import { bootstrapAdmin, createUser, decideAdminRequest, getCurrentUser, listAdminRequests, listUsers, login, requestAdmin } from "../services/authService.js";
import { successResponse } from "../utils/response.js";

export const bootstrap = async (req, res, next) => { try { return successResponse(res, await bootstrapAdmin(req.body), "Administrator account created", 201); } catch (error) { return next(error); } };
export const signIn = async (req, res, next) => { try { return successResponse(res, await login(req.body), "Signed in successfully"); } catch (error) { return next(error); } };
export const me = async (req, res, next) => { try { return successResponse(res, req.user, "Current user fetched successfully"); } catch (error) { return next(error); } };
export const addUser = async (req, res, next) => { try { return successResponse(res, await createUser(req.body), "User account created", 201); } catch (error) { return next(error); } };
export const users = async (req, res, next) => { try { return successResponse(res, await listUsers(), "Users fetched successfully"); } catch (error) { return next(error); } };
export const submitAdminRequest = async (req, res, next) => { try { return successResponse(res, await requestAdmin(req.body), "Administrator request submitted for primary-admin approval", 201); } catch (error) { return next(error); } };
export const adminRequests = async (req, res, next) => { try { return successResponse(res, await listAdminRequests(), "Administrator requests fetched successfully"); } catch (error) { return next(error); } };
export const decideRequest = async (req, res, next) => { try { return successResponse(res, await decideAdminRequest({ id: req.params.id, approve: req.body.approve === true }), req.body.approve ? "Administrator approved" : "Administrator request rejected"); } catch (error) { return next(error); } };
