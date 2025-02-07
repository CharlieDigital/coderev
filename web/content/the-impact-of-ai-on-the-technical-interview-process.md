---
date: 2025-02-08
author: Charles Chen
description: AI's increasing competency at complex tasks like coding creates a boon for teams that want to harness AI to boost productivity.  However, many teams haven't stopped to rethink their technical candidate screening and qualification process to account for these rapid changes.
---

# The Impact of AI on the Technical Interview Process

[{{ $doc.author }}]{.post-author} - [{{ $doc.date }}]{.post-date}

[{{ $doc.description }}]{.post-desc}

At the end of 2024, the startup I had joined was slowly winding down in an acqui-hire.  As a part of this process, the entire engineering team would need to go through a round of technical interviews as a part of the leveling process.

To prepare for this, the team was told to prepare by studying leetcode and system design as these were known to be a part of the process for several of the potential acquiring companies.

Candidates that have been through this process are surely familiar with Gayle McDowell's *Cracking the Coding Interview* which goes thorough strategies, tips, and refreshers for many experienced engineers who may be far removed from these types of algorithmic brain teasers.

Other common resources include leetcode.com, hackerrank.com, [IGotAnOffer on YT](https://www.youtube.com/@IGotAnOffer-Engineering) and a host of other similar services that facilitate this cat-and-mouse game of simply "teaching the test".

---

What is clear after going through several days of reading McDowell's book, practice sessions on leetcode.com, and watching YouTube videos on practice system design interviews is just how banal the whole process is. Don't get me wrong, leetcode.com was actually *kinda fun* doing it at my own pace, comparing my submissions with others, and working to solve these puzzles.  But as a candidate selection tool? There was no congruency to much of the volume of code that I had shipped in my 20 year career.

The system design ones were somehow even more outrageous given that system design is often the deciding factor between a mid/senior level and a staff/principal level engineer.  Yet watching the IGotAnOffer video series successively reveals just how *formulaic* and predictable the response and banter is designed to be.

To distill it, you can probably think about it in 10 steps:

1. Ascertain the non-functional requirements (# of users, volume, etc.)
2. Dive into the stated requirements and clarify
3. Make up some obviously complex requirements that will be "out of scope"
4. Draw a database -- don't forget to either have read replicas or shard to scale
5. Draw a cluster of application services (of course you need a cluster to scale it!)
6. Draw an application load balancer that's in front of the cluster
7. Draw an API gateway/WAF in front of that to filter traffic
8. Draw a CDN to efficiently cache and serve binary content
9. Draw an in memory cache like Redis or Memcached for frequently read data to prevent database reads
10. Draw a queue somewhere so you can throttle, buffer, coordinate, or sequence some mutations.

Watching the videos, it was pretty clear that this is the basic formula with only minor variations by domain.  Why? Given the typical 60-90 minute session, how deep can you actually go with a topic as complex as system design?  Not very.  So the compromise is that the design remains at a high level and thus ***any backend API will pretty much look like bullets 4-10***.

While the coding challenges themselves are not nearly as scripted as the system design interview, if you spend enough time working on them you will get a sense for the general classes of solution patterns and I think that doing this correct classification step is probably the most important one in most cases when working on leetcode challenges.

Indeed, with a few weeks of practice, interviews with several large, public companies were a relative breeze (particularly system design!).

---

These processes seem to perpetuate in a vacuum as if ignoring how rapidly AI is changing the field of software engineering with advancements month-over-month if not seemingly weekly!  While AI may not *(yet)* be the right tool to build whole systems, it is already quite competent in both autocompletion as well as generation of standalone units of code and can solve N-Queens hundreds of times faster than I could!

> This last month is the first time that an LLM could "one shot" their second round assessment.

In a discussion with one of the senior hiring managers, the topic of AI came up and he shared some interesting perspective.  Periodically, this manager takes their battery of assessments and runs them through an LLM to see how well it does at solving the first and second round questions and he shared that this last month is the first time that an LLM could "one shot" their second round assessment.

Given this reality, the question is: ***now what?***

Is the right answer to simply design a more complex set of assessments?  To make it even more *Rube Goldberg*? *To what end?*

Throughout this whole process of interviewing with a handful of companies, it was surprising that not once was a code review incorporated into the process.  Yet proficiency at code reviews (or reading and evaluating code in general) is one of the most practical first-day and day-to-day skills -- **especially** for evaluating senior engineers.

Code reviews seem to have several benefits that address several challenges in the interview process.

For starters, code reviews focus more on communication and collaboration more naturally than coding challenges which bias more towards deep focus.  Coding challenges are ironically a *terrible* vehicle for evaluating how well a candidate thinks via communication because it is so unnatural to talk while coding.

Code reviews also have the benefit that it allows for measuring both more depth and breadth in one pass.  For example, a code review of a small React app, an API, and a database schema can easily identify a candidate's strength bias in the stack while still allowing measurement of the depth of their knowledge.

- Incorporate some obvious bugs in the React app and some not so obvious ones.
- Leave off some validation in the API or exclude exception handling entirely.
- Design a database and choose some obviously wrong data types and leave off some indices; see if they can make the connection from the API call pattern to the database indices that should be created or a data type that should be refactored.

The variations are endless yet practical; a reflection of real day-to-day skills.

Perhaps more importantly, as the field of software engineering inevitably shifts to increased and widespread adoption of AI powered tools in building software, it would seem that a key skill to actively screen for is proficiency in reading and evaluating code along the vectors of correctness, security, performance, best practices, and so on.

It is indeed true that the ability to read and evaluate code is not the same as the ability to write and organize code, but in this emerging age of AI generated code, *does this distinction carry the same weight*?

---

As AI continues to progress and advance, it seems inevitable that engineering teams will need to adjust their technical screening processes with an understanding that the shift in how engineers build software is already well underway.

AI's increasing competency at coding means that rather than selecting purely for the ability to solve complex coding puzzles and algorithmic challenges, more teams should start to consider how well the human shepherds are at evaluating the quality of that voluminous output.

Rather than entirely shifting away from existing processes, teams should start to consider incorporating code reviews as a key step in the candidate selection process to identify those with a proficiency to effectively evaluating code.
