import {
    ExperienceContentDbModel,
    ExperienceDbModel,
    ExperienceHighlightPointDbModel,
    ExperienceImageDbModel,
    ExperienceMaterialDbModel,
    ExperienceOrganizerDbModel,
    ExperienceSessionDbModel,
    ExperienceSessionTicketDbModel,
    ExperienceTicketDbModel,
    ExperienceTransparencyDbModel
} from "../../../src/database";

export const clearTestExperienceDataByUserId = async (userId: number) => {
    const createdExperiencesList = await ExperienceDbModel.findAll({
        where: {
            userId
        },
        attributes: ['id']
    });

    const experienceIds: number[] = createdExperiencesList.map(item => {
        return (item as any).id;
    });

    const createdSessionList = await ExperienceSessionDbModel.findAll({
        where: {
            experienceId: experienceIds
        },
        attributes: ['id']
    });

    const sessionIds: number[] = createdSessionList.map(item => {
        return (item as any).id;
    });

    await ExperienceSessionTicketDbModel.destroy({
        where: { sessionId: sessionIds },
        force: true
    });

    await Promise.all([
        ExperienceTicketDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceSessionDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceOrganizerDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceHighlightPointDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceContentDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceTransparencyDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceMaterialDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        }),

        ExperienceImageDbModel.destroy({
            where: { experienceId: experienceIds },
            force: true
        })
    ]);

    await ExperienceDbModel.destroy({
        where: { userId },
        force: true
    });
};
