function generateId() {
    var id = new Date().getTime();
    return id;
}

function addProject(projName, projVersion, iconPath, projDir) {
    var id = generateId();
    var projectObj = {};
    projectObj.id = id;
    projectObj.projDir = projDir;
    projectObj.projName = projName;

    if (localStorage["projects"]) {
        // retrieve exsiting projects to appending a new project
        var projects = JSON.parse(localStorage["projects"]);        
        projects.push(projectObj);      
        localStorage["projects"] = JSON.stringify(projects);   
        console.log(JSON.stringify(projects));    
    } else {
        var myProjects = new Array();
        myProjects.push(projectObj);        
        localStorage["projects"] = JSON.stringify(myProjects);
        console.log(JSON.stringify(myProjects));
    }

    // render newly added project to GUI & set it as the active widget
    addProjectWidget(id, projName, projVersion, iconPath, projDir);
    setActiveWidget(id, projDir);
}

function removeMissingProjects(i) {
    // removes a project from localStorage if the project is not found on the file system
    var projects = JSON.parse(localStorage["projects"]);
    var projDir = projects[i].projDir;
    var filename = projDir + "/www/config.xml";
    
    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
            projects.splice(i, 1);
            localStorage["projects"] = JSON.stringify(projects);
        }
    });       
}

function getProjects() {
    if (localStorage["projects"]) {
        var projects = JSON.parse(localStorage["projects"]);
        var index = projects.length;
                
        for (var i=0;i<index;i++) {
            removeMissingProjects(i);            
        }

        var sortedProjects = projects.sort(sortByProperty("projName"));
        localStorage["projects"] = JSON.stringify(sortedProjects);
                
        setTimeout(renderProjects, 1000);          

    }  
}

function renderProjects() {
    var projects = JSON.parse(localStorage["projects"]);
    var index = projects.length;
    
    for (var i=0;i<index;i++) {
        var id = projects[i].id;
        var projDir = projects[i].projDir;
        getProjectConfig(id, projDir, i); 
    }
    
    console.log(JSON.stringify(projects));    
}

function getProjectConfig(id, projDir, i) {
    var filename = projDir + "/www/config.xml";

    fs.readFile(filename, 'utf8', function(err, data) {
        if (err) throw err;
        
        var iconPath = projDir + "/www/";

        global.jQuery.xmlDoc = global.jQuery.parseXML(data);
        global.jQuery.xml = global.jQuery(global.jQuery.xmlDoc);

        // get the project name
        var projectName = global.jQuery.xml.find("name").text();

        // get the project version
        var projectVersion = global.jQuery.xml.find("widget").attr("version");

        // get the app icon
        var projectIcon = global.jQuery.xml.find("icon").attr("src");
        iconPath += projectIcon;

        addProjectWidget(id, projectName, projectVersion, iconPath, projDir);
        
        if (i == 0) {
            setActiveWidget(id, projDir);            
        }
    });
}

function removeProjectById(currentId) {

    // retrieve exsiting projects to find the project to remove
    var projects = JSON.parse(localStorage["projects"]);        
    var index = projects.length;
    
    for (var i=0;i<index;i++) {
        
        var id = projects[i].id;
        
        if (id == currentId) {
            projects.splice(i, 1);
            break;
        }
    }
    
    localStorage["projects"] = JSON.stringify(projects);
  
    console.log(JSON.stringify(projects));  
        
    index = projects.length;
    
     // set new active widget if there are still projects, otherwise disable the remove button
    if (index > 0) {
        //resetMinusButtonState();
        setActiveWidget(projects[0].id, projects[0].projDir);       
    } else {
        disableMinusButton();
        global.jQuery("#status-field").hide();
        global.jQuery("#guide-add").show();
        serverOfflineState();
    }
   
}

function updateProjectNameInLocalStorage(id, projectName) {
    if (localStorage["projects"]) {
        var projects = JSON.parse(localStorage["projects"]);

        for (var i = 0; i < projects.length; i++) {
            if (id === projects[i].id) {
                projects[i].projName = projectName;
                break;
            }
        }

        localStorage["projects"] = JSON.stringify(projects);
    }
}