    import { useEffect, useState } from "react";

    export default function MyProjects() {
        const [owned, setOwned] = useState([]);
        const [contributed, setContributed] = useState([]);
        const [loading, setLoading] = useState(true);

        const token = JSON.parse(localStorage.getItem("user"))?.token;
        console.log(token);
        useEffect(() => {
            async function fetchProjects() {
                try {
                    const res = await fetch("/api/project/myprojects", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json"
                        }
                    });
                    const data = await res.json();
                    const userData = JSON.parse(localStorage.getItem("user"));
                    const userId = userData?._id; 
                    console.log(data);
                    console.log(userId);
                    console.log("LOCALSTORAGE USER:", JSON.parse(localStorage.getItem("user")));

                    setOwned(data.filter(p => p.owner._id === userId));
                    setContributed(data.filter(p => p.contributors.some(c => c._id === userId)));

                } catch (err) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            }

            fetchProjects();
        }, [token]);

        if (loading) return <div>Loading...</div>;

        return (
            <div className="p-6 max-w-3xl mx-auto">

                <h2 className="text-2xl font-semibold mb-4">My Projects</h2>

                {owned.length === 0 && contributed.length === 0 && (
                    <div>No projects yet</div>
                )}

                {owned.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-2">Owned by me</h3>
                        {owned.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}

                {contributed.length > 0 && (
                    <div>
                        <h3 className="text-xl font-semibold mb-2">Shared with me</h3>
                        {contributed.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        );
    }

    function ProjectCard({ project }) {
        return (
            <div className="border p-4 rounded-lg mb-3 flex justify-between items-center">
                <div>
                    <div className="text-lg font-medium">{project.title}</div>
                    <div className="text-gray-600 text-sm">Language: {project.language}</div>
                </div>

                <button
                    className="px-3 py-1 bg-blue-600 text-white rounded"
                    onClick={() => (window.location.href = `/editor/${project._id}`)}
                >
                    Open
                </button>
            </div>
        );
    }
