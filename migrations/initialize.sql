CREATE TABLE FOLDER (
    id         INTEGER   PRIMARY KEY AUTOINCREMENT,
    title      VARCHAR   NOT NULL,
    createdAt  INTEGER   NOT NULL,
    userEmail  VARCHAR   NOT NULL
);

CREATE TABLE FILE (
    id         INTEGER   PRIMARY KEY AUTOINCREMENT,
    title      VARCHAR   NOT NULL,
    extension  VARCHAR   DEFAULT '',
    createdAt  INTEGER   NOT NULL,
    deletedAt  INTEGER,
    bytes      BLOB      NOT NULL,
    folderId   INTEGER   NOT NULL,
    FOREIGN KEY(folderId) REFERENCES FOLDER(id)
);

CREATE TABLE TEMPORARY_LINK (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    link    VARCHAR NOT NULL,
    fileId  INTEGER NOT NULL,
    FOREIGN KEY(fileId) REFERENCES FILE(id)
);

CREATE TABLE PROHIBITED_EXTENSION (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    extension VARCHAR NOT NULL
);

INSERT INTO PROHIBITED_EXTENSION(extension)
     VALUES ('php');

INSERT INTO FOLDER(title, createdAt, userEmail)
          VALUES ('Documents', 1675300000, 'user1@example.com'),
                 ('Music', 1675400000, 'user1@example.com'),
                 ('Videos', 1675500000, 'user1@example.com'),
                 ('Documents', 1675600000, 'user2@example.com'),
                 ('Videos', 1675700000, 'user2@example.com');

INSERT INTO FILE(title, extension, createdAt, deletedAt, bytes, folderId)
          VALUES ('homework1', 'txt', 1675310000, 0, X'00FF00FF', 1),
                 ('homework2', 'txt', 1675320000, NULL, X'AABBAABB', 1),
                 ('homework3', 'docx', 1675330000, NULL, X'CCDDCCDD', 1),
                 ('homework4', 'doc', 1675340000, NULL, X'EEDDEEFF', 1),
                 ('song1', 'mp3', 1675410000, NULL, X'AABBCCDD', 2),
                 ('song2', 'wav', 1675420000, NULL, X'AABBCCDDEE', 2),
                 ('video1', 'webm', 1675510000, NULL, X'AABBCCDDEEFFFF', 3),
                 ('video2', 'mp4', 1675520000, NULL, X'AABBCCDDEEFFFF112233', 3),
                 ('no_ext', '', 1675510000, NULL, X'AABBCCDDEEFFFF', 4),
                 ('video3', 'mp4', 1675520000, NULL, X'AABBCCDDEEFFFF112233', 5);
