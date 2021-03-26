import React from 'react';
import logo from '../../assets/Logo.svg';

function IndexArticle() {
    return (
        <div>
            <h1><img src={logo} className="heading-logo" alt="logo"/> Cortex Video Service</h1>

            <div className="middle-font-text">
                <p>Cortex Video Service (CVS) is an open-source Video API that brings people together globally through
                    interactive live video calls.</p>
                <p>CVS makes it easy to build a custom video experience within any mobile, web, or desktop application and is
                    built on the WebRTC industry standard that is available on billions of devices.</p>
                <h3>CVS advantages</h3>
                <ol>
                    <li>Fast build and launch. All the functionality is available out-of-the-box.</li>
                    <li>There are examples of applications and all the manuals.</li>
                    <li>Docker files are ready and configured.</li>
                </ol>
            </div>

            <h3>GitHub</h3>
            <table className="table-no-border">
                <tbody>
                <tr>
                    <td><span className="semibold color-gray">CVS Main Page:</span></td>
                    <td className="dont-break-out">
                        <a href="https://github.com/CortexVideoServices"
                           target="_blank">https://github.com/CortexVideoServices</a>
                    </td>
                </tr>
                <tr>
                    <td><span className="semibold color-gray">CVS Server:</span></td>
                    <td className="dont-break-out">
                        <a href="https://github.com/CortexVideoServices/Server"
                           target="_blank">https://github.com/CortexVideoServices/Server</a>
                    </td>
                </tr>
                <tr>
                    <td><span className="semibold color-gray">CVS React SDK:</span></td>
                    <td className="dont-break-out">
                        <a href="https://github.com/CortexVideoServices/Web"
                           target="_blank">https://github.com/CortexVideoServices/Web</a>
                    </td>
                </tr>
                <tr>
                    <td><span className="semibold color-gray">CVS Android SDK:</span></td>
                    <td className="dont-break-out">
                        <a href="https://github.com/CortexVideoServices/Android"
                           target="_blank">https://github.com/CortexVideoServices/Android</a>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>

);
}

export default IndexArticle;