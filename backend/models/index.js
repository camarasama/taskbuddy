/**
 * TaskBuddy Models Index
 * 
 * Central export point for all database models
 * Import models using: const { UserModel, TaskModel } = require('./models');
 */

module.exports = {
    FamilyModel: require('./FamilyModel'),
    UserModel: require('./UserModel'),
    FamilyMemberModel: require('./FamilyMemberModel'),
    TaskModel: require('./TaskModel'),
    TaskAssignmentModel: require('./TaskAssignmentModel'),
    TaskSubmissionModel: require('./TaskSubmissionModel'),
    RewardModel: require('./RewardModel'),
    RewardRedemptionModel: require('./RewardRedemptionModel'),
    NotificationModel: require('./NotificationModel'),
    PointsLogModel: require('./PointsLogModel'),
    RegistrationSessionModel: require('./RegistrationSessionModel')
};
